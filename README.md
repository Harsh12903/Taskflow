# ⚡ TaskFlow — Setup & Deployment Guide

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm v8+

---

### 1. Install Backend

```bash
cd taskflow/backend
npm install
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Runs at **http://localhost:5000**

---

### 2. Install Frontend

```bash
cd taskflow/frontend
npm install
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Runs at **http://localhost:3000**

---

## 🚢 Deploying to Railway

Two services need to be created on Railway — one for the backend and one for the frontend — plus a **MongoDB Atlas** database.

---

### Step 1 — Set Up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **free cluster** (M0)
3. Under **Database Access** → create a user with a username and password
4. Under **Network Access** → click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Go to the cluster → click **Connect** → **Connect your application**
6. Copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Add the database name before the `?`:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
   ```
   Save this — it will be needed in the next step.

---

### Step 2 — Deploy the Backend on Railway

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select the repository
3. Set the **Root Directory** to `backend`
4. Once the service is created, go to the **Variables** tab and add:

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | Atlas connection string from Step 1 |
   | `JWT_SECRET` | any long random string e.g. `taskflow_secret_xyz_2024` |
   | `JWT_EXPIRE` | `7d` |
   | `NODE_ENV` | `production` |

5. Go to **Settings** → **Networking** → click **Generate Domain**
6. Copy the generated domain — e.g. `taskflow-backend.up.railway.app`

Check the **Deploy Logs** tab — it should show:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

### Step 3 — Deploy the Frontend on Railway

1. In the same Railway project → click **New** → **GitHub Repo** → select the same repo
2. Set the **Root Directory** to `frontend`
3. Go to the **Variables** tab and add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend-domain.up.railway.app/api` |

   Replace `your-backend-domain` with the actual domain copied in Step 2.

4. Go to **Settings** → set **Build Command** to:
   ```
   npm run build
   ```
5. Set **Start Command** to:
   ```
   npx serve dist
   ```
6. Go to **Settings** → **Networking** → **Generate Domain** for the frontend

> `npx serve dist` is needed because Railway doesn't serve static files automatically. Add `serve` to frontend dependencies first:
> ```bash
> cd frontend && npm install serve
> ```
> Push the change to GitHub — Railway will redeploy automatically.

---

### Step 4 — Verify Everything Works

1. Open the frontend Railway domain in the browser
2. Sign up for a new account
3. Open the browser **Network tab** (F12) and confirm API calls are going to the Railway backend URL
4. Create a project and task — if data saves and loads, the MongoDB Atlas connection is working

---


## 🔁 How the Three Parts Connect

```
Browser (Frontend on Railway)
        ↓  HTTPS requests to VITE_API_URL
Backend API (Railway) — PORT 5000
        ↓  mongoose connection via MONGO_URI
MongoDB Atlas (Cloud database)
```

