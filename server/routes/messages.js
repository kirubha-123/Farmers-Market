const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Specific routes (/conversations, /unread/count) MUST be declared
// BEFORE the wildcard route (/:userId), otherwise Express matches them wrong.
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/messages
// @desc    Send a message (and notify recipient)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { to, text, product, negotiatedPrice } = req.body;
    const from = req.user.id;

    if (!to || !text) {
      return res.status(400).json({ message: 'Recipient and text are required' });
    }

    // Save message
    const newMessage = new Message({ from, to, text, product, negotiatedPrice });
    const message = await newMessage.save();

    // ✅ Notify the recipient
    try {
      const sender = await User.findById(from);
      const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
      await Notification.create({
        recipientId: to,
        title: `New message from ${sender.name}`,
        message: `"${preview}"`,
        type: 'system'
      });
    } catch (notifErr) {
      // Don't fail the whole request if notification fails
      console.warn('Notification creation failed:', notifErr.message);
    }

    // Populate and return
    const populated = await Message.findById(message._id)
      .populate('from', 'name role profilePic')
      .populate('to',   'name role profilePic');

    res.json(populated);
  } catch (err) {
    console.error('POST /messages error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    List of conversations for the logged-in user
// @access  Private
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('from', 'name role profilePic')
      .populate('to',   'name role profilePic');

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUser   = msg.from._id.toString() === userId ? msg.to   : msg.from;
      const otherUserId = otherUser._id.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user:        otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      // Count unread messages sent TO me
      if (msg.to._id.toString() === userId && !msg.read) {
        conversationMap.get(otherUserId).unreadCount += 1;
      }
    }

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    console.error('GET /conversations error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Total count of unread messages for logged-in user
// @access  Private
// NOTE: This MUST come before /:userId or Express will treat "unread" as a userId
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({ to: req.user.id, read: false });
    res.json({ count });
  } catch (err) {
    console.error('GET /unread/count error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/messages/:userId
// @desc    Full message thread between logged-in user and :userId
// @access  Private
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const userId      = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: userId,      to: otherUserId },
        { from: otherUserId, to: userId      }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('from', 'name role profilePic')
      .populate('to',   'name role profilePic');

    res.json(messages);
  } catch (err) {
    console.error('GET /:userId error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/messages/read/:otherUserId
// @desc    Mark all messages from :otherUserId as read
// @access  Private
router.put('/read/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId      = req.user.id;
    const otherUserId = req.params.otherUserId;

    await Message.updateMany(
      { from: otherUserId, to: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('PUT /read/:otherUserId error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
