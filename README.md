# 🎓 Smart College Complaint & Issue Management System

A full-stack MERN web application that allows college students to report campus issues and enables administrators to manage and resolve them efficiently.

---

## 🚀 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React.js + Tailwind CSS       |
| Backend    | Node.js + Express.js          |
| Database   | MongoDB + Mongoose            |
| Auth       | JWT (JSON Web Tokens)         |
| Images     | Multer (local) / Cloudinary   |
| Charts     | Chart.js + react-chartjs-2    |

---

## 📁 Project Structure

```
smart-complaint-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── complaintController.js # Complaint CRUD
│   │   ├── voteController.js      # Voting system
│   │   ├── commentController.js   # Comments
│   │   ├── userController.js      # User management
│   │   └── analyticsController.js # Analytics data
│   ├── middleware/
│   │   ├── auth.js                # JWT protection
│   │   ├── upload.js              # Multer upload
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Complaint.js           # Complaint schema
│   │   ├── Vote.js                # Vote schema
│   │   └── Comment.js             # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── userRoutes.js
│   │   ├── voteRoutes.js
│   │   ├── commentRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   └── seed.js                # Demo data seeder
│   ├── uploads/                   # Local image storage
│   ├── server.js                  # Entry point
│   ├── .env.example               # Environment template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Badges.js      # Status & Priority badges
    │   │   │   ├── ComplaintCard.js
    │   │   │   ├── LoadingSpinner.js
    │   │   │   ├── Pagination.js
    │   │   │   └── StatCard.js
    │   │   └── layout/
    │   │       ├── StudentLayout.js  # Sidebar for students
    │   │       └── AdminLayout.js    # Sidebar for admins
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state
    │   ├── pages/
    │   │   ├── public/
    │   │   │   ├── HomePage.js
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.js
    │   │   │   ├── SubmitComplaint.js
    │   │   │   ├── MyComplaints.js
    │   │   │   ├── ComplaintDetail.js
    │   │   │   ├── ComplaintFeed.js
    │   │   │   └── StudentProfile.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── ManageComplaints.js
    │   │       ├── AdminComplaintDetail.js
    │   │       ├── ManageUsers.js
    │   │       └── Analytics.js
    │   ├── utils/
    │   │   ├── api.js             # Axios instance
    │   │   └── helpers.js         # Utilities
    │   ├── App.js                 # Routes
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 16
- MongoDB running locally OR MongoDB Atlas URI
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd smart-complaint-system

# Install all dependencies (root + backend + frontend)
npm run install-all
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_complaint_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
- **Admin:** `admin@college.edu` / `admin123`
- **Students:** `arjun@college.edu` / `student123`, `priya@college.edu` / `student123`
- 8 sample complaints with votes and comments

### 4. Run the App

```bash
# From root directory — runs both frontend & backend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

## 🔐 User Roles & Access

### Student
| Feature | Access |
|---------|--------|
| Register / Login | ✅ |
| Submit complaint (with image) | ✅ |
| View own complaints | ✅ |
| Track complaint status | ✅ |
| View community feed | ✅ |
| Upvote complaints | ✅ |
| Add comments | ✅ |
| Edit profile / change password | ✅ |

### Admin
| Feature | Access |
|---------|--------|
| View ALL complaints | ✅ |
| Update status & priority | ✅ |
| Add admin notes | ✅ |
| Manage users (activate/deactivate/delete) | ✅ |
| View analytics with charts | ✅ |
| Add admin comments | ✅ |

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register         Register
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user
PUT    /api/auth/profile          Update profile
PUT    /api/auth/change-password  Change password
```

### Complaints
```
GET    /api/complaints            Get complaints (filtered)
GET    /api/complaints/feed       Public feed for voting
POST   /api/complaints            Submit complaint (multipart)
GET    /api/complaints/:id        Get single complaint
PUT    /api/complaints/:id        Update (admin only)
DELETE /api/complaints/:id        Delete complaint
```

### Votes
```
POST   /api/votes/:complaintId    Toggle vote
GET    /api/votes/:complaintId    Get vote count
```

### Comments
```
POST   /api/comments/:complaintId Add comment
GET    /api/comments/:complaintId Get all comments
DELETE /api/comments/:id          Delete comment
```

### Users (Admin only)
```
GET    /api/users                 List all users
GET    /api/users/:id             Get user
PUT    /api/users/:id             Update user
DELETE /api/users/:id             Delete user
```

### Analytics
```
GET    /api/analytics             Full analytics (admin)
GET    /api/analytics/student     Student's own stats
```

---

## 🏷️ Complaint Categories
- 🏫 Classroom Issues
- 🔬 Lab Equipment Problems
- 📶 WiFi / Network Issues
- 🏠 Hostel Complaints
- 📚 Library Issues
- 🧹 Cleanliness Issues
- 📋 Other

## 📊 Complaint Statuses
- ⏳ Pending
- 🔄 In Progress
- ✅ Resolved
- ❌ Rejected

## 🚦 Priority Levels
- 🟢 Low
- 🟡 Medium
- 🟠 High
- 🔴 Critical

---

## 🔒 Security Features
- JWT authentication with token expiry
- Password hashing with bcryptjs (12 salt rounds)
- Rate limiting on all routes (stricter on auth)
- Helmet.js for HTTP security headers
- Role-based route protection
- File type + size validation for uploads
- Input validation & sanitization

---

## 📸 Image Upload
Images are stored locally in `/backend/uploads/`. To use Cloudinary in production, set `UPLOAD_PROVIDER=cloudinary` in `.env` and add Cloudinary credentials.

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)
```bash
cd backend
# Set all .env variables in your platform dashboard
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
# Set REACT_APP_API_URL=https://your-backend-url/api
npm run build
```

---

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
MIT License — free to use and modify.
# smart-complaint-system
