# Architectural Mapping

## Technical Stack
- **Database**: MongoDB (Mongoose ODM)
- **Backend Framework**: Node.js & Express.js
- **Frontend Core**: React 18, React Router v6
- **Styling**: Tailwind CSS v3, Glassmorphism, Mesh Gradients
- **Animations**: Framer Motion, GSAP, Three.js (Particle engine)
- **Real-time Interface**: Socket.io 
- **Chart Generation**: Chart.js, react-chartjs-2

## Collection Mappings & Hooks
- `User`: Handles Authentication logic, role routing, resolution stats.
- `Complaint`: Central hub. Integrates View Counts, automated Trending Score algorithms, AI Tag extraction emulation.
- `Comment`: Linked to Complaints and Users - provides the realtime discussion capabilities.
- `Vote`: Provides uniqueness enforcement to avoid spamming the trending engine.
- `Notification`: Websocket integrated broadcast schema.
- `ActivityLog`: Comprehensive Audit trail for the admin backend dashboards.

## System Capabilities
- Global Application state management via synchronized pure Context APIs.
- Optimistic UI updates off high-speed websockets.
- Dual-role rendering components.
- Secure HTTP Only cookie simulation via encapsulated localStorage interception hooks.
- Complex MongoDB Aggregation queries specifically mapped to render advanced Chart outputs.
