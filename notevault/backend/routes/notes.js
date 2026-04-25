// const router = require('express').Router();
// const auth   = require('../middleware/auth');
// const Note   = require('../models/Note');

// // All notes routes require authentication
// router.use(auth);

// // ── GET /api/notes ───────────────────────────────────────────────────────────
// router.get('/', async (req, res) => {
//   try {
//     const { search, tag } = req.query;

//     const filter = { user: req.user._id };

//     if (search) {
//       filter.$or = [
//         { title:   { $regex: search, $options: 'i' } },
//         { content: { $regex: search, $options: 'i' } },
//       ];
//     }

//     if (tag) filter.tags = tag;

//     const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
//     res.json(notes);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch notes' });
//   }
// });

// // ── POST /api/notes ──────────────────────────────────────────────────────────
// router.post('/', async (req, res) => {
//   try {
//     const { title, content, color, tags } = req.body;

//     if (!title?.trim())
//       return res.status(400).json({ message: 'Title is required' });

//     const note = await Note.create({
//       user: req.user._id,
//       title: title.trim(),
//       content: content || '',
//       color,
//       tags: tags || [],
//     });

//     res.status(201).json(note);
//   } catch (err) {
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ message: Object.values(err.errors)[0].message });
//     }
//     res.status(500).json({ message: 'Failed to create note' });
//   }
// });

// // ── PUT /api/notes/:id ───────────────────────────────────────────────────────
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, content, color, pinned, tags } = req.body;

//     const note = await Note.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       { title, content, color, pinned, tags },
//       { new: true, runValidators: true }
//     );

//     if (!note)
//       return res.status(404).json({ message: 'Note not found' });

//     res.json(note);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to update note' });
//   }
// });

// // ── DELETE /api/notes/:id ────────────────────────────────────────────────────
// router.delete('/:id', async (req, res) => {
//   try {
//     const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });

//     if (!note)
//       return res.status(404).json({ message: 'Note not found' });

//     res.json({ message: 'Note deleted', id: req.params.id });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to delete note' });
//   }
// });

// // ── PATCH /api/notes/:id/pin ─────────────────────────────────────────────────
// router.patch('/:id/pin', async (req, res) => {
//   try {
//     const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
//     if (!note) return res.status(404).json({ message: 'Note not found' });

//     note.pinned = !note.pinned;
//     await note.save();

//     res.json(note);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to pin note' });
//   }
// });

// module.exports = router;
const router = require('express').Router();
const auth   = require('../middleware/auth');
const Note   = require('../models/Note');

// All notes routes require authentication
router.use(auth);

// ── GET /api/notes ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;

    const filter = { user: req.user._id };

    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) filter.tags = tag;

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// ── POST /api/notes ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, content, color, tags, type, items } = req.body;

    if (!title?.trim())
      return res.status(400).json({ message: 'Title is required' });

    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content: content || '',
      color,
      tags: tags || [],
      type: type || 'text',
      items: items || [],
    });

    res.status(201).json(note);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// ── PUT /api/notes/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { title, content, color, pinned, tags, type, items } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, color, pinned, tags, type, items },
      { new: true, runValidators: true }
    );

    if (!note)
      return res.status(404).json({ message: 'Note not found' });

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// ── DELETE /api/notes/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!note)
      return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// ── PATCH /api/notes/:id/pin ─────────────────────────────────────────────────
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.pinned = !note.pinned;
    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to pin note' });
  }
});

module.exports = router;