require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const importData = async () => {
  try {
    console.log('🔄 Cleaning up existing data in Supabase...');
    
    // Deleting from profiles will cascade to all other tables due to ON DELETE CASCADE
    // But since PostgREST doesn't support deleting without a filter or matching all cleanly without risk of blocking
    // We will do a generic delete.
    const { error: delErr } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
       console.log('Warning on cleanup:', delErr.message);
    }
    
    const adminPassword = 'admin123';
    const studentPassword = 'student123';

    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash(adminPassword, salt);
    const studentHash = await bcrypt.hash(studentPassword, salt);

    // Create Admins
    console.log('👤 Creating Admins...');
    const admin1 = {
      id: crypto.randomUUID(), name: "Hamza Saiyed", email: "saiyedhamza7171@gmail.com", 
      password_hash: await bcrypt.hash("Saiyed@5747", salt), role: "admin", department: "Administration"
    };
    const admin2 = {
      id: crypto.randomUUID(), name: "Zaid Shaikh", email: "zaidshaikhus2254@gmail.com", 
      password_hash: await bcrypt.hash("Password@123", salt), role: "admin", department: "Administration"
    };
    
    await supabase.from('profiles').insert([admin1, admin2]);

    // Create Students
    console.log('🎓 Creating Students...');
    const studentData = [
      { id: crypto.randomUUID(), name: "Arjun Sharma", email: "arjun@college.edu", department: "CS", roll_number: "CS2021001" },
      { id: crypto.randomUUID(), name: "Priya Patel", email: "priya@college.edu", department: "Electronics", roll_number: "EC2021002" },
      { id: crypto.randomUUID(), name: "Rahul Singh", email: "rahul@college.edu", department: "Mechanical", roll_number: "ME2021003" },
      { id: crypto.randomUUID(), name: "Ananya Gupta", email: "ananya@college.edu", department: "Civil", roll_number: "CV2021004" },
      { id: crypto.randomUUID(), name: "Vikram Mehta", email: "vikram@college.edu", department: "CS", roll_number: "CS2021005" },
      { id: crypto.randomUUID(), name: "Sneha Iyer", email: "sneha@college.edu", department: "Biotech", roll_number: "BT2021006" }
    ].map(s => ({ ...s, password_hash: studentHash, role: 'student' }));

    await supabase.from('profiles').insert(studentData);

    // Create Complaints
    console.log('📝 Creating Complaints...');
    const cData = [
      { title: "Projector not working in Room 101", description: "Bulb fused.", category: "Classroom Issues", location: "Block A - 101", priority: "High", status: "In Progress", votes: 12 },
      { title: "WiFi down in entire library", description: "No signal since morning.", category: "WiFi / Network Issues", location: "Library Main", priority: "Critical", status: "Pending", votes: 34 },
      { title: "Broken oscilloscopes in ECE Lab", description: "Screen dead.", category: "Lab Equipment Problems", location: "ECE Lab 2", priority: "Medium", status: "Resolved", votes: 8, resolved_at: new Date().toISOString() },
      { title: "Hostel bathroom leaks Block C", description: "Roof dripping.", category: "Hostel Complaints", location: "Block C G-Floor", priority: "High", status: "Pending", votes: 19 },
      { title: "Library reference section disorganized", description: "Books mismanaged.", category: "Library Issues", location: "Library Ref Section", priority: "Low", status: "Pending", votes: 4 },
      { title: "Canteen garbage overflowing", description: "Please empty trash.", category: "Cleanliness Issues", location: "Main Canteen", priority: "High", status: "In Progress", votes: 22 },
      { title: "AC broken in main seminar hall", description: "Compressor dead.", category: "Classroom Issues", location: "Seminar Hall", priority: "Critical", status: "Pending", votes: 41 },
      { title: "Lab computers extremely slow", description: "Needs RAM upgrade.", category: "Lab Equipment Problems", location: "CS Lab 1", priority: "Medium", status: "Resolved", votes: 11, resolved_at: new Date().toISOString() },
      { title: "No WiFi in hostel Block A", description: "Router not responding.", category: "WiFi / Network Issues", location: "Hostel Block A", priority: "High", status: "In Progress", votes: 28 },
      { title: "Broken gate at campus entrance", description: "Hinge broken.", category: "Other", location: "Main Gate", priority: "Medium", status: "Pending", votes: 7 }
    ];

    const complaints = [];
    for (let i = 0; i < cData.length; i++) {
      const c = cData[i];
      const owner = studentData[i % studentData.length].id;
      const isAssigned = [0, 5, 8].includes(i);
      const pastDate = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
      const complaintId = crypto.randomUUID();
      
      const comp = {
        id: complaintId,
        title: c.title, description: c.description, category: c.category, location: c.location, 
        priority: c.priority, status: c.status, votes: c.votes, created_by: owner,
        assigned_to: isAssigned ? admin1.id : null,
        resolved_at: c.resolved_at || null, admin_note: c.status === 'Resolved' ? 'Fixed by maintenance.' : '',
        trending_score: c.votes * (1 / Math.pow(10 + 2, 1.5)),
        created_at: pastDate
      };
      complaints.push(comp);
    }
    await supabase.from('complaints').insert(complaints);

    console.log('✅ Database seeded successfully into Supabase!');
    console.log('📋 Admin 1: saiyedhamza7171@gmail.com / Saiyed@5747');
    console.log('📋 Admin 2: zaidshaikhus2254@gmail.com / Zaid@2254');
    console.log('👤 Student: arjun@college.edu / student123');
    
    process.exit();
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    process.exit(1);
  }
};

importData();
