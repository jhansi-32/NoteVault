const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendAuthResponse = (res, status, user, token) =>
  res.status(status).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: 'An account with this email already exists' });

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    sendAuthResponse(res, 201, user, token);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    // explicitly select password (field has select:false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user._id);
    sendAuthResponse(res, 200, user, token);
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const protect = require('../middleware/auth');

router.get('/me', protect, (req, res) => {
  const { _id: id, name, email, createdAt } = req.user;
  res.json({ id, name, email, createdAt });
});

module.exports = router;
