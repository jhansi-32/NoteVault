
const mongoose = require('mongoose');

const NOTE_COLORS = ['#1a1a1a', '#1a2a1a', '#1a1a2a', '#2a1a1a', '#1a2a2a', '#2a1a2a'];

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title too long'],
  },
  content: {
    type: String,
    default: '',
    maxlength: [10000, 'Content too long'],
  },
  // note type: 'text' (default) or 'list' (bullet checklist)
  type: {
    type: String,
    enum: ['text', 'list'],
    default: 'text',
  },
  // bullet point items for list-type notes
  items: {
    type: [
      {
        text:    { type: String, default: '' },
        checked: { type: Boolean, default: false },
      }
    ],
    default: [],
  },
  color: {
    type: String,
    default: '#1a1a1a',
    enum: { values: NOTE_COLORS, message: 'Invalid color' },
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

// Compound index for fast user-specific queries sorted by date
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);