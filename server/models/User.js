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
    loanProfile: {
      dateOfBirth: String,
      addressLine1: String,
      addressLine2: String,
      pincode: String,
      aadhaarNumber: String,
      panNumber: String,
      annualIncome: Number,
      requestedLoanAmount: Number,
      loanPurpose: String,
      bankName: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      // Farmer-focused fields
      landAreaAcres: Number,
      farmingExperienceYears: Number,
      primaryCrops: String,
      irrigationType: String,
      consentToLoanProcessing: { type: Boolean, default: false },
    },
    buyerProfile: {
      businessName: String,
      businessType: String,
      gstNumber: String,
      yearsInBusiness: Number,
      monthlyPurchaseVolume: Number,
      preferredCategories: String,
      purchaseFrequency: String,
      deliveryAddress: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
