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

// ── CORS Configuration ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL, // from Render env
  "https://note-vault-lovat.vercel.app" // your Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ── Middleware ─────────────────────────────────────────────────────
app.use(express.json());

// ── Database ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// ── Health Check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});