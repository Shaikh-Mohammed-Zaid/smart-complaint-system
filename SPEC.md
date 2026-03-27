# SPEC.md - Smart College Complaint & Issue Management System

## Overview
A complete, production-ready, full-stack Smart College Complaint & Issue Management System as a single deployable application. No placeholder code, zero TODOs, zero mock data.

## Tech Stack
- **Frontend:** React.js 18, React Router v6, Tailwind CSS v3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Upload:** Multer for complaint image uploads (store locally in /uploads)
- **Charts:** Chart.js + react-chartjs-2
- **Toasts:** react-hot-toast
- **HTTP:** Axios with interceptors
- **Security:** helmet, cors, express-rate-limit, express-async-errors

## Critical Requirements
1. NEVER return password in any API response
2. Complaint feed route (/feed) MUST be registered BEFORE /:id route
3. Vote toggle must use atomic findOne+delete or findOne+create
4. resolvedAt only set once
5. Image delete on complaint delete
6. Mongoose indexes must be defined in schema
7. All pagination: skip = (page-1) * limit
8. hasVoted must be computed per-user in every list response
9. Mobile sidebar: use translate-x transforms
10. Chart.js MUST register all required components explicitly
11. frontend/src/index.css must import @tailwind directives
12. All async controller functions caught by express-async-errors
13. JWT token stored in localStorage as 'token'
14. AuthContext useEffect verifies token on every page load
15. date-fns for all date formatting

*(See original prompt for full details on schemas, API routes, and Frontend pages)*
