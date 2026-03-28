const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // ✅ Import Auth Middleware

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, loanProfile, buyerProfile } = req.body;

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be farmer or buyer' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone,
      location,
      loanProfile: role === 'farmer' ? (loanProfile || {}) : {},
      buyerProfile: role === 'buyer' ? (buyerProfile || {}) : {},
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        loanProfile: user.loanProfile || {},
        buyerProfile: user.buyerProfile || {},
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        loanProfile: user.loanProfile || {},
        buyerProfile: user.buyerProfile || {},
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT /api/auth/profile - UPDATE PROFILE ROUTE
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, location, phone, about, specialty, loanProfile, buyerProfile } = req.body;
    
    // Find user by ID attached from auth middleware
    const user = await User.findById(req.user.id);
    
    if (user) {
      // Keep updates explicit so empty strings can be saved when needed.
      if (name !== undefined) user.name = name;
      if (location !== undefined) user.location = location;
      if (phone !== undefined) user.phone = phone;
      if (about !== undefined) user.about = about;
      if (specialty !== undefined) user.specialty = specialty;

      if (user.role === 'farmer' && loanProfile && typeof loanProfile === 'object') {
        user.loanProfile = {
          ...(user.loanProfile || {}),
          ...loanProfile,
        };
      }

      if (user.role === 'buyer' && buyerProfile && typeof buyerProfile === 'object') {
        user.buyerProfile = {
          ...(user.buyerProfile || {}),
          ...buyerProfile,
        };
      }
      
      const updatedUser = await user.save();
      
      // Return updated user data (exclude password)
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        phone: updatedUser.phone,
        about: updatedUser.about,
        specialty: updatedUser.specialty,
        loanProfile: updatedUser.loanProfile || {},
        buyerProfile: updatedUser.buyerProfile || {},
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ GET /api/auth/user/:id - Get basic user info
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name role profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
