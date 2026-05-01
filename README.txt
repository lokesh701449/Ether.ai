================================================================================
                    ETHARA.AI — TEAM TASK MANAGER
                         README Documentation
================================================================================

OVERVIEW
--------
A full-stack collaborative task management web application where teams can 
create projects, assign tasks, and track progress with role-based access control.

Live URL    : https://ether-ai-production.up.railway.app
GitHub Repo : https://github.com/lokesh701449/Ether.ai


FEATURES
--------
* User Authentication   — Secure signup/login with JWT tokens
* Role-Based Access     — Admin and Member roles with different permissions
* Project Management    — Create projects, add/remove team members
* Task Management       — Create, assign, update, and delete tasks with priority & due dates
* Dashboard             — Real-time stats: total tasks, by status, per user, overdue count
* Responsive UI         — Dark-themed, modern interface that works on all devices


TECH STACK
----------
  Frontend  : React 19, Vite, React Router, Axios
  Backend   : Node.js, Express.js
  Database  : MongoDB, Mongoose ODM
  Auth      : JWT (jsonwebtoken), bcryptjs
  Styling   : Vanilla CSS (custom design system)
  Deployment: Railway


PROJECT STRUCTURE
-----------------
  Ethara.ai/
  ├── server/                   # Backend API
  │   ├── config/db.js          # MongoDB connection
  │   ├── controllers/          # Route handlers (auth, project, task, user)
  │   ├── middleware/            # Auth (JWT) & role guard middleware
  │   ├── models/               # Mongoose schemas (User, Project, Task)
  │   ├── routes/               # Express route definitions
  │   ├── seed.js               # Demo data seeder script
  │   ├── server.js             # Entry point
  │   └── .env                  # Environment variables
  ├── client/                   # React frontend
  │   ├── src/
  │   │   ├── api/              # Axios instance with JWT interceptor
  │   │   ├── components/       # Sidebar, Layout, ProtectedRoute, ParticleBackground
  │   │   ├── context/          # AuthContext (login/register/logout state)
  │   │   └── pages/            # Dashboard, Projects, Tasks, Users, Login, Register
  │   └── index.html
  ├── package.json              # Root build scripts for deployment
  ├── nixpacks.toml             # Railway build configuration
  └── README.txt


LOCAL SETUP
-----------

Prerequisites:
  - Node.js 20+
  - MongoDB (local or Atlas)

Step 1: Clone & Install

  git clone https://github.com/lokesh701449/Ether.ai.git
  cd Ether.ai

  # Install backend dependencies
  cd server && npm install

  # Install frontend dependencies
  cd ../client && npm install

Step 2: Configure Environment

  Create file: server/.env

    PORT=5001
    MONGO_URI=mongodb://localhost:27017/team-task-manager
    JWT_SECRET=your_secret_key_here
    JWT_EXPIRE=7d

Step 3: Seed Demo Data (Optional)

  cd server && node seed.js

  This creates 4 users, 3 projects, and 18 tasks with realistic data.

Step 4: Run the Application

  # Terminal 1 — Backend
  cd server && npm run dev

  # Terminal 2 — Frontend
  cd client && npm run dev

  Backend runs at: http://localhost:5001
  Frontend runs at: http://localhost:5173


DEMO CREDENTIALS
----------------
  Role      Email                 Password
  -----     -----                 --------
  Admin     lokesh@ethara.ai      admin123
  Member    priya@ethara.ai       member123
  Member    rahul@ethara.ai       member123
  Member    ananya@ethara.ai      member123


API ENDPOINTS
-------------

  Authentication:
    POST   /api/auth/register          Public    Register new user
    POST   /api/auth/login             Public    Login and get JWT token
    GET    /api/auth/me                Private   Get current logged-in user

  Projects:
    GET    /api/projects               Private   List projects (filtered by role)
    POST   /api/projects               Admin     Create new project
    PUT    /api/projects/:id           Admin     Update project details
    DELETE /api/projects/:id           Admin     Delete project and its tasks
    POST   /api/projects/:id/members   Admin     Add member to project
    DELETE /api/projects/:id/members/:userId   Admin   Remove member

  Tasks:
    GET    /api/tasks                  Private   List tasks (filterable by project/status/priority)
    GET    /api/tasks/stats/dashboard  Private   Dashboard statistics & aggregations
    POST   /api/tasks                  Admin     Create new task
    PUT    /api/tasks/:id              Private   Update task (Admin: all fields, Member: status only)
    DELETE /api/tasks/:id              Admin     Delete task

  Users:
    GET    /api/users                  Admin     List all users
    GET    /api/users/:id             Admin     Get single user details


ROLE-BASED ACCESS CONTROL
-------------------------

  ADMIN can:
    - View all projects and tasks across the system
    - Create, edit, and delete projects
    - Add and remove project members
    - Create, edit, and delete tasks
    - Assign tasks to any user
    - View all users
    - See global dashboard statistics

  MEMBER can:
    - View only projects they are a member of
    - View only tasks within their projects
    - Update the status of tasks assigned to them (Todo/In Progress/Done)
    - See dashboard stats scoped to their projects
    - Cannot create/delete projects or tasks
    - Cannot access the Users page



================================================================================
  Built by Lokesh Chalasani | 2026
================================================================================
