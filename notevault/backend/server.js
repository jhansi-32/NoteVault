
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


// ─────────────────────────────────────────────────────────────
// ✅ CORS CONFIG (Vercel + local + preview)
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL, // set in Render env
  "https://note-vault-neon.vercel.app", // your main frontend
  "http://localhost:5173", // local dev
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow Postman / mobile apps
    if (!origin) return callback(null, true);

    // allow exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL Vercel preview URLs
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ VERY IMPORTANT: handle preflight requests
app.options('*', cors(corsOptions));


// ─────────────────────────────────────────────────────────────
// ✅ MIDDLEWARE
// ─────────────────────────────────────────────────────────────
app.use(express.json());


// ─────────────────────────────────────────────────────────────
// ✅ DATABASE CONNECTION
// ─────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });


// ─────────────────────────────────────────────────────────────
// ✅ ROUTES
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));


// ─────────────────────────────────────────────────────────────
// ✅ HEALTH CHECK (Render uses this)
// ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});


// ─────────────────────────────────────────────────────────────
// ✅ 404 HANDLER
// ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// ─────────────────────────────────────────────────────────────
// ✅ GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});


// ─────────────────────────────────────────────────────────────
// ✅ START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});