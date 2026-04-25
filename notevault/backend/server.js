// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // ── Middleware ──────────────────────────────────────────────────────────────
// app.use(cors({
//   origin: process.env.FRONTEND_URL || '*',
//   credentials: true,
// }));
// app.use(express.json());

// // ── Database ────────────────────────────────────────────────────────────────
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// // ── Routes ──────────────────────────────────────────────────────────────────
// app.use('/api/auth',  require('./routes/auth'));
// app.use('/api/notes', require('./routes/notes'));

// app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// // ── 404 handler ─────────────────────────────────────────────────────────────
// app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// // ── Global error handler ─────────────────────────────────────────────────────
// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
// });

// // ── Start ────────────────────────────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────────────────────────────
// ✅ CORS CONFIG (handles Vercel + local + preview URLs)
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL, // production URL from Render env
  "https://note-vault-neon.vercel.app", // your main Vercel domain
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    // allow exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow all Vercel preview deployments automatically
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

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
// ✅ HEALTH CHECK (important for Render)
// ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
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