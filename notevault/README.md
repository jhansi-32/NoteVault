# ◆ NoteVault

> Your private digital notebook — beautifully designed, securely stored.

NoteVault is a full-stack personal notes management web application built with the MERN stack. Create an account, log in, and get your own secure space to write, organize, search, and manage notes. Every note is tied to your account — no one else can see your data.

![Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Stack](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [How to Use the App](#how-to-use-the-app)
- [Security](#security)

---

## Features

- **Real Authentication** — Signup, login, and logout with JWT tokens
- **Password Security** — Passwords hashed with bcrypt (12 salt rounds), never stored in plain text
- **Create Notes** — Title, content, color-coded background, and comma-separated tags
- **Edit Notes** — Update any note in a clean modal editor
- **Delete Notes** — Permanently remove notes with a confirmation prompt
- **Pin Notes** — Pin important notes to the top of your dashboard
- **Search** — Real-time search across note titles and content simultaneously
- **Tag Filtering** — Filter notes by tag from the sidebar
- **6 Color Themes** — Color-code notes for visual organization
- **Auto-redirect** — Expired tokens auto-clear and redirect to login
- **Per-user isolation** — Notes are strictly scoped to the logged-in user

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Vite   |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB (Atlas), Mongoose ODM     |
| Auth      | JSON Web Tokens (JWT), bcryptjs   |
| HTTP      | Axios with request/response interceptors |
| Deploy    | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
notevault/
├── backend/
│   ├── middleware/
│   │   └── auth.js          ← JWT verification middleware
│   ├── models/
│   │   ├── User.js          ← User schema with bcrypt password hashing
│   │   └── Note.js          ← Note schema with tags, colors, pinning
│   ├── routes/
│   │   ├── auth.js          ← POST /signup, POST /login, GET /me
│   │   └── notes.js         ← Full CRUD + PATCH /pin
│   ├── server.js            ← Express app entry point
│   ├── .env.example         ← Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js     ← Axios instance with JWT + 401 interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx  ← Global auth state (login/signup/logout)
│   │   ├── components/
│   │   │   ├── NoteCard.jsx     ← Note card with actions menu
│   │   │   └── NoteModal.jsx    ← Create/edit note modal
│   │   ├── pages/
│   │   │   ├── Login.jsx        ← Login page
│   │   │   ├── Signup.jsx       ← Signup page
│   │   │   └── Dashboard.jsx    ← Main notes dashboard
│   │   ├── App.jsx          ← Router with protected + public routes
│   │   ├── main.jsx         ← React entry point
│   │   └── index.css        ← Global styles and design tokens
│   ├── index.html
│   ├── vite.config.js       ← Vite config with /api proxy
│   ├── .env.example
│   └── package.json
│
├── DEPLOYMENT.md            ← Step-by-step deployment guide
├── .gitignore
└── README.md
```

---

## Getting Started (Local)

### Prerequisites

- Node.js v18 or higher
- npm
- A free [MongoDB Atlas](https://cloud.mongodb.com) account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notevault.git
cd notevault
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

```bash
npm run dev
# → 🚀 Server running on port 5000
# → ✅ MongoDB connected
```

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server automatically proxies all `/api` requests to `http://localhost:5000` — no extra config needed.

Open your browser at **http://localhost:5173**

---

## Environment Variables

### Backend — `backend/.env`

```env
# Server
PORT=5000

# MongoDB Atlas connection string
# Get this from: Atlas → Database → Connect → Drivers
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/notevault?retryWrites=true&w=majority

# JWT Secret — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_character_random_secret_here

# Your deployed frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
# Only needed for production deployment
# In development, Vite proxy handles this automatically
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## API Reference

### Auth Routes

| Method | Endpoint         | Auth Required | Description                  |
|--------|------------------|---------------|------------------------------|
| POST   | /api/auth/signup | No            | Register a new user          |
| POST   | /api/auth/login  | No            | Login, returns JWT token     |
| GET    | /api/auth/me     | Yes           | Get current logged-in user   |

**Signup / Login request body:**
```json
{
  "name": "Jhansi Gandham",
  "email": "jhansi@example.com",
  "password": "yourpassword"
}
```

**Signup / Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "663f1a...",
    "name": "Jhansi Gandham",
    "email": "jhansi@example.com"
  }
}
```

---

### Notes Routes

All notes routes require `Authorization: Bearer <token>` header.

| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | /api/notes          | Get all notes (supports ?search=, ?tag=) |
| POST   | /api/notes          | Create a new note                  |
| PUT    | /api/notes/:id      | Update an existing note            |
| DELETE | /api/notes/:id      | Delete a note                      |
| PATCH  | /api/notes/:id/pin  | Toggle pin on/off                  |

**Create / Update note body:**
```json
{
  "title": "My Note",
  "content": "Note body text here",
  "color": "#1a2a1a",
  "tags": ["work", "ideas"]
}
```

---

## Deployment

### MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a free **M0** cluster
3. Go to **Security → Database Access** → Add a database user
4. Go to **Security → Network Access** → Add `0.0.0.0/0` (allow all IPs)
5. Go to **Database → Connect → Drivers** → Copy the connection string
6. Replace `<password>` with your actual password and add your database name after `.net/`:
   ```
   mongodb+srv://user:pass@cluster0.abc.mongodb.net/notevault?retryWrites=true&w=majority
   ```

### Backend → Render (Free)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → **New + → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`
6. Click **Create Web Service**
7. Copy your Render URL: `https://notevault-api.onrender.com`

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
4. Add environment variable:
   - `VITE_API_URL` = `https://notevault-api.onrender.com/api`
5. Click **Deploy**
6. Copy your Vercel URL: `https://notevault.vercel.app`

### Final Step — Update CORS

Go back to **Render → Environment** and set:
```
FRONTEND_URL=https://notevault.vercel.app
```

---

## How to Use the App

### Signing Up
Navigate to `/signup`, enter your full name, email, and a password (min. 6 characters). Click **Create vault** — you are instantly logged in and taken to your dashboard.

### Creating a Note
Click **+ New note** in the left sidebar. Fill in:
- **Title** (required)
- **Content** — your note body
- **Tags** — comma separated e.g. `work, study, ideas`
- **Color** — pick one of 6 color themes for the card

Click **Create note** — it appears in the grid immediately.

### Managing Notes
Click the **···** button on any note card to:
- **✎ Edit** — update title, content, tags, or color
- **◆ Pin** — moves the note to the top "Pinned" section
- **✕ Delete** — permanently removes the note

You can also click anywhere on the card to open the editor.

### Search
Type in the search bar at the top of the dashboard. It searches both titles and content in real time as you type.

### Filter by Tag
Tags you add to notes appear in the left sidebar. Click any tag to filter — only notes with that tag will show. Click it again or press ✕ to clear the filter.

### Signing Out
Click your name at the bottom of the sidebar → click **↩ Sign out**.

---

## Security

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcrypt with 12 salt rounds |
| Password field exposure | `select: false` on Mongoose schema — never returned in queries |
| Authentication | JWT tokens, expire in 7 days |
| Token storage | localStorage, cleared on logout or 401 response |
| Route protection | All note routes verify JWT and check note ownership |
| CORS | Restricted to your frontend domain in production |
| Secrets | All sensitive values in `.env` files, never committed to Git |

---

## License

MIT — feel free to use, modify, and deploy for your own projects.

---
You click "Create vault"
        ↓
React sends POST /api/auth/signup
        ↓
Express backend receives name, email, password
        ↓
bcrypt hashes the password
        ↓
Mongoose saves the document to MongoDB Atlas
        ↓
Atlas → notevault database → users collection ✅





> Built with ◆ by Jhansi Gandham