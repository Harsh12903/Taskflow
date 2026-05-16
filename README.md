# ⚡ TaskFlow — MERN Project Management App

A full-featured project management application built with **MongoDB, Express, React (Parcel), and Node.js** with **Tailwind CSS**.

---

## 🗂️ Project Structure

```
taskflow/
├── backend/                  # Express + MongoDB API
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt, JWT)
│   │   ├── Project.js        # Project with members & roles
│   │   └── Task.js           # Tasks with status, priority, due dates
│   ├── routes/
│   │   ├── auth.js           # Signup, Login, Profile
│   │   ├── projects.js       # CRUD + member management
│   │   ├── tasks.js          # Task CRUD with role checks
│   │   ├── dashboard.js      # Aggregated stats
│   │   └── users.js          # User search
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── .env                  # Environment variables
│   └── server.js             # Express entry point
│
└── frontend/                 # React + Parcel + Tailwind
    ├── src/
    │   ├── index.html        # HTML entry (Parcel source)
    │   ├── index.jsx         # React app root + routes
    │   ├── styles.css        # Tailwind + custom classes
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   └── api.js        # Axios instance with JWT
    │   ├── components/
    │   │   └── shared/
    │   │       └── Layout.jsx # Sidebar + navigation
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── SignupPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── ProjectsPage.jsx
    │       ├── ProjectDetailPage.jsx
    │       └── MyTasksPage.jsx
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .parcelrc
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **npm** v8+

---

### 1. Clone / Navigate to the project

```bash
cd taskflow
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

> For **MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string.

### 4. Start the Backend

```bash
# In the backend/ directory
npm run dev       # with hot reload (nodemon)
# or
npm start         # production
```

The API runs at **http://localhost:5000**

---

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment

Edit `frontend/.env`:

```env
API_URL=http://localhost:5000/api
```

### 7. Start the Frontend (Parcel Bundler)

```bash
# In the frontend/ directory
npm start
```

Parcel bundles and serves the app at **http://localhost:3000**

---

## 🏃 Running Both Together

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd taskflow/backend && npm run dev

# Terminal 2 — Frontend
cd taskflow/frontend && npm start
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Bundler | **Parcel v2** |
| Styling | **Tailwind CSS v3** |
| Charts | Recharts |
| HTTP | Axios |
| Toast | React Hot Toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |

---

## ✨ Features

### Authentication
- Signup with Name, Email, Password
- Secure login with JWT (7-day expiry)
- Token auto-refresh via Axios interceptors

### Project Management
- Create projects (creator becomes Admin automatically)
- Color-coded projects
- Admin: add/remove members, set roles
- Member: view assigned projects and tasks

### Task Management
- Create tasks: Title, Description, Due Date, Priority
- Assign tasks to project members
- Status: **To Do → In Progress → Done**
- Priority: Low, Medium, High, Critical
- Members can only update status of their own tasks
- Admins have full task CRUD access

### Dashboard
- Total projects, tasks, completed, overdue counts
- Task status breakdown (donut chart)
- Tasks per user (bar chart)
- Recent tasks and overdue task lists

### Role-Based Access
- **Admin**: Full control — create/edit/delete tasks, manage members
- **Member**: View project, update own task status only

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | Get project tasks |
| GET | `/api/tasks/my-tasks` | Get my assigned tasks |
| POST | `/api/tasks` | Create task (Admin) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard stats |

---

## 🎨 Design System

- **Font**: Syne (display) + JetBrains Mono
- **Theme**: Dark (surface-950 base)
- **Accent**: Indigo/brand-600 (#4f46e5)
- **Cards**: Glassmorphism with subtle borders
- **Animations**: CSS fade-in, slide-up transitions

---

## 🧪 Development Tips

```bash
# Clear Parcel cache if build issues
cd frontend && npm run clean && npm start

# Check API health
curl http://localhost:5000/api/health

# MongoDB connection test
# Make sure mongod is running:
mongod --dbpath /usr/local/var/mongodb
```
