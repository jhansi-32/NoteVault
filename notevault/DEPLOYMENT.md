# NoteVault — Complete Deployment Guide

## Stack
| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React + Vite              |
| Backend  | Node.js + Express         |
| Database | MongoDB Atlas (free tier) |
| Deploy   | Render (backend) + Vercel (frontend) |

---

## Step 1 — MongoDB Atlas (Free Database)

1. Go to **https://cloud.mongodb.com** → Create free account
2. Click **"Build a Database"** → choose **M0 Free**
3. Pick a region close to you → click **Create**
4. **Security > Database Access** → Add a user with a strong password
5. **Security > Network Access** → Add `0.0.0.0/0` (allow all IPs for cloud deploys)
6. **Deployment > Database** → Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notevault?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your credentials.

---

## Step 2 — Deploy Backend to Render (Free)

1. Go to **https://render.com** → Create free account
2. Click **"New +"** → **Web Service**
3. Connect your GitHub repo (push the `backend/` folder as a repo, or the full monorepo)
4. Configure:
   - **Name**: `notevault-api`
   - **Root Directory**: `backend` (if monorepo)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add **Environment Variables**:
   | Key           | Value                              |
   |---------------|------------------------------------|
   | `MONGODB_URI` | your Atlas connection string       |
   | `JWT_SECRET`  | any 64-char random string          |
   | `FRONTEND_URL`| https://notevault.vercel.app (add after step 3) |
   | `NODE_ENV`    | production                         |

6. Click **Create Web Service** → wait ~2 mins for deployment
7. Copy your Render URL: `https://notevault-api.onrender.com`

---

## Step 3 — Deploy Frontend to Vercel (Free)

1. Go to **https://vercel.com** → Create free account
2. Click **"Add New..."** → **Project** → Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variables**:
   | Key           | Value                                           |
   |---------------|-------------------------------------------------|
   | `VITE_API_URL`| `https://notevault-api.onrender.com/api`        |

5. Click **Deploy** → wait ~1 min
6. Your app is live at: `https://notevault-<your-slug>.vercel.app`

---

## Step 4 — Update CORS on Backend

Go back to **Render → Environment** → update `FRONTEND_URL` to your Vercel URL:
```
FRONTEND_URL=https://notevault-<your-slug>.vercel.app
```
Render will auto-redeploy.

---

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env       # Fill in your real values
npm install
npm run dev                # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```
The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## API Endpoints

### Auth
| Method | Endpoint         | Auth? | Description          |
|--------|------------------|-------|----------------------|
| POST   | /api/auth/signup | ✗     | Register new user    |
| POST   | /api/auth/login  | ✗     | Login, get JWT       |
| GET    | /api/auth/me     | ✓     | Get current user     |

### Notes
| Method | Endpoint              | Auth? | Description              |
|--------|-----------------------|-------|--------------------------|
| GET    | /api/notes            | ✓     | Get all notes (+ search) |
| POST   | /api/notes            | ✓     | Create note              |
| PUT    | /api/notes/:id        | ✓     | Update note              |
| DELETE | /api/notes/:id        | ✓     | Delete note              |
| PATCH  | /api/notes/:id/pin    | ✓     | Toggle pin               |

---

## Project Structure

```
notevault/
├── backend/
│   ├── models/
│   │   ├── User.js         ← bcrypt password hashing
│   │   └── Note.js         ← notes with tags, colors, pinning
│   ├── routes/
│   │   ├── auth.js         ← signup / login / me
│   │   └── notes.js        ← full CRUD + pin toggle
│   ├── middleware/
│   │   └── auth.js         ← JWT verification
│   ├── server.js           ← Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js    ← Axios instance + interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   ├── NoteCard.jsx
    │   │   └── NoteModal.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## Security Checklist ✅

- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT tokens expire in 7 days
- [x] Password field has `select: false` in Mongoose (never returned)
- [x] 401 interceptor auto-clears stale tokens and redirects to login
- [x] All note routes verify ownership (`user: req.user._id`)
- [x] CORS restricted to your frontend domain in production
- [x] `.env` files are gitignored — secrets never committed
