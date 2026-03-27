require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const connectDB = require('../config/db');

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Complaint.deleteMany();
    await Vote.deleteMany();
    await Comment.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();

    // Passwords will be hashed strictly by the User schema pre-save hook
    const adminPassword = 'admin123';
    const studentPassword = 'student123';

    // Create Admins
    const admin1 = await User.create({
      name: "Hamza Saiyed", email: "saiyedhamza7171@gmail.com", password: "Saiyed@5747",
      role: "admin", department: "Administration"
    });
    const admin2 = await User.create({
      name: "Zaid Shaikh", email: "zaidshaikhus2254@gmail.com", password: "Zaid@2254",
      role: "admin", department: "Administration"
    });
    // const admin3 = await User.create({
    //   name: "Admin Three", email: "admin3@college.edu", password: adminPassword,
    //   role: "admin", department: "Administration"
    // });

    // Use admin1 as the primary admin for seed data
    const adminUser = admin1;
    const adminUser2 = admin2;
    // Create Students
    const studentData = [
      { name: "Arjun Sharma", email: "arjun@college.edu", dept: "CS", roll: "CS2021001" },
      { name: "Priya Patel", email: "priya@college.edu", dept: "Electronics", roll: "EC2021002" },
      { name: "Rahul Singh", email: "rahul@college.edu", dept: "Mechanical", roll: "ME2021003" },
      { name: "Ananya Gupta", email: "ananya@college.edu", dept: "Civil", roll: "CV2021004" },
      { name: "Vikram Mehta", email: "vikram@college.edu", dept: "CS", roll: "CS2021005" },
      { name: "Sneha Iyer", email: "sneha@college.edu", dept: "Biotech", roll: "BT2021006" }
    ];

    const students = await Promise.all(studentData.map(s => User.create({
      name: s.name, email: s.email, password: studentPassword, role: 'student', department: s.dept, rollNumber: s.roll
    })));

    // Create 10 Complaints
    const cData = [
      { title: "Projector not working in Room 101", desc: "Bulb fused.", cat: "Classroom Issues", loc: "Block A - 101", pri: "High", status: "In Progress", votes: 12 },
      { title: "WiFi down in entire library", desc: "No signal since morning.", cat: "WiFi / Network Issues", loc: "Library Main", pri: "Critical", status: "Pending", votes: 34 },
      { title: "Broken oscilloscopes in ECE Lab", desc: "Screen dead.", cat: "Lab Equipment Problems", loc: "ECE Lab 2", pri: "Medium", status: "Resolved", votes: 8, resolvedAt: Date.now() },
      { title: "Hostel bathroom leaks Block C", desc: "Roof dripping.", cat: "Hostel Complaints", loc: "Block C G-Floor", pri: "High", status: "Pending", votes: 19 },
      { title: "Library reference section disorganized", desc: "Books mismanaged.", cat: "Library Issues", loc: "Library Ref Section", pri: "Low", status: "Pending", votes: 4 },
      { title: "Canteen garbage overflowing", desc: "Please empty trash.", cat: "Cleanliness Issues", loc: "Main Canteen", pri: "High", status: "In Progress", votes: 22 },
      { title: "AC broken in main seminar hall", desc: "Compressor dead.", cat: "Classroom Issues", loc: "Seminar Hall", pri: "Critical", status: "Pending", votes: 41 },
      { title: "Lab computers extremely slow", desc: "Needs RAM upgrade.", cat: "Lab Equipment Problems", loc: "CS Lab 1", pri: "Medium", status: "Resolved", votes: 11, resolvedAt: Date.now() },
      { title: "No WiFi in hostel Block A", desc: "Router not responding.", cat: "WiFi / Network Issues", loc: "Hostel Block A", pri: "High", status: "In Progress", votes: 28 },
      { title: "Broken gate at campus entrance", desc: "Hinge broken.", cat: "Other", loc: "Main Gate", pri: "Medium", status: "Pending", votes: 7 }
    ];

    const complaints = [];
    for (let i = 0; i < cData.length; i++) {
      const c = cData[i];
      const owner = students[i % students.length]._id;
      const comp = await Complaint.create({
        title: c.title, description: c.desc, category: c.cat, location: c.loc, priority: c.pri, status: c.status,
        votes: c.votes, createdBy: owner,
        assignedTo: [0, 5, 8].includes(i) ? adminUser._id : null, 
        resolvedAt: c.resolvedAt || null, adminNote: c.status === 'Resolved' ? 'Fixed by maintenance.' : ''
      });
      // Set created 10 hours ago roughly to compute a mock trendingScore
      comp.createdAt = new Date(Date.now() - 10 * 60 * 60 * 1000);
      comp.trendingScore = comp.votes * (1 / Math.pow(10 + 2, 1.5));
      await comp.save({ validateBeforeSave: false });
      complaints.push(comp);
    }

    // Assign mock votes
    for (let comp of complaints) {
      const maxV = Math.min(comp.votes, students.length - 1); // limit mock voters
      let count = 0;
      for (let stu of students) {
        if (count >= maxV) break;
        if (stu._id.toString() !== comp.createdBy.toString()) {
          await Vote.create({ userId: stu._id, complaintId: comp._id });
          count++;
        }
      }
    }

    // Mock Comments
    await Comment.create({ complaintId: complaints[2]._id, userId: adminUser._id, comment: "Parts ordered.", isAdminComment: true });
    await Comment.create({ complaintId: complaints[2]._id, userId: complaints[2].createdBy, comment: "Thank you!" });
    await Comment.create({ complaintId: complaints[5]._id, userId: adminUser._id, comment: "Cleaning staff dispatched.", isAdminComment: true });
    await Comment.create({ complaintId: complaints[5]._id, userId: students[1]._id, comment: "Still stinks." });
    await Comment.create({ complaintId: complaints[6]._id, userId: students[2]._id, comment: "Super hot in here." });
    await Comment.create({ complaintId: complaints[6]._id, userId: students[3]._id, comment: "+1 please fix." });
    await Comment.create({ complaintId: complaints[7]._id, userId: adminUser._id, comment: "RAM upgraded.", isAdminComment: true });
    await Comment.create({ complaintId: complaints[8]._id, userId: adminUser._id, comment: "Network team arriving today.", isAdminComment: true });

    // Mock Notifications & Activity (just a few)
    await Notification.create({ userId: students[0]._id, type: "status_update", title: "Status Updated", message: "Complaint resolved.", complaintId: complaints[2]._id });
    await Notification.create({ userId: students[1]._id, type: "vote_milestone", title: "Popular Complaint", message: "Reached 10 votes", complaintId: complaints[0]._id });

    await ActivityLog.create({ userId: adminUser._id, action: "status_updated", entityType: "complaint", entityId: complaints[2]._id, metadata: { from: 'In Progress', to: 'Resolved' } });
    await ActivityLog.create({ userId: adminUser._id, action: "status_updated", entityType: "complaint", entityId: complaints[7]._id, metadata: { from: 'Pending', to: 'Resolved' } });
    await ActivityLog.create({ userId: students[0]._id, action: "complaint_created", entityType: "complaint", entityId: complaints[0]._id });

    console.log('✅ Database seeded successfully!');
    console.log('📋 Admin 1: admin1@college.edu / admin123');
    console.log('📋 Admin 2: admin2@college.edu / admin123');
    console.log('📋 Admin 3: admin3@college.edu / admin123');
    console.log('👤 Student:  arjun@college.edu / student123');
    console.log('📊 Created: 9 users | 10 complaints | 40+ votes | 8 comments');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();
