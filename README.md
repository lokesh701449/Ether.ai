# Ethara.ai — Team Task Manager

A full-stack collaborative task management web application where teams can create projects, assign tasks, and track progress with role-based access control.

## 🚀 Features

- **User Authentication** — Secure signup/login with JWT tokens
- **Role-Based Access** — Admin and Member roles with different permissions
- **Project Management** — Create projects, add/remove team members
- **Task Management** — Create, assign, update, and delete tasks with priority & due dates
- **Dashboard** — Real-time stats: total tasks, by status, per user, overdue count
- **Responsive UI** — Dark-themed, modern interface that works on all devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Vanilla CSS (custom design system) |

## 📁 Project Structure

```
Ethara.ai/
├── server/                 # Backend API
│   ├── config/db.js        # MongoDB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth & role guard
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── seed.js             # Demo data seeder
│   ├── server.js           # Entry point
│   └── .env                # Environment variables
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Sidebar, Layout, ProtectedRoute
│   │   ├── context/        # AuthContext (JWT state)
│   │   └── pages/          # Dashboard, Projects, Tasks, Users
│   └── index.html
└── README.md
```

## ⚡ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Ethara.ai

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### 3. Seed Demo Data (Optional)

```bash
cd server && node seed.js
```

This creates 4 users, 3 projects, and 18 tasks with realistic data.

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:5173

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | lokesh@ethara.ai | admin123 |
| Member | priya@ethara.ai | member123 |
| Member | rahul@ethara.ai | member123 |
| Member | ananya@ethara.ai | member123 |

## 📡 API Endpoints

### Authentication
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Current user |

### Projects
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/projects` | Private | List projects |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/tasks` | Private | List tasks (filterable) |
| GET | `/api/tasks/stats/dashboard` | Private | Dashboard statistics |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user details |

## 🌐 Deployment (Railway)

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a MongoDB plugin (or use MongoDB Atlas)
4. Deploy the backend with environment variables
5. Deploy the frontend (set `VITE_API_URL` if needed)
6. Ensure both services are connected

## 📄 License

MIT
