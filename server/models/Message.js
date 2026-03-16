const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
    negotiatedPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
