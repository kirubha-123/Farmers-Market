const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    phone: String,
    location: String,
    profilePic: String,
    about: String,
    specialty: String, // e.g., 'Organic Vegetables', 'High-quality Grains'
    avatar: String, // Alias or specific path for profile image
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
