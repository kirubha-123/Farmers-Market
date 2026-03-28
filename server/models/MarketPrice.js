const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    market: { type: String, required: true, trim: true },
    state: { type: String, default: 'Tamil Nadu', trim: true },
    crop: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    minPrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, required: true, min: 0 },
    modalPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg', trim: true },
    source: { type: String, default: 'manual' }
  },
  { timestamps: true }
);

marketPriceSchema.index({ market: 1, crop: 1, date: 1 }, { unique: true });
marketPriceSchema.index({ market: 1, date: 1 });
marketPriceSchema.index({ crop: 1, date: 1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
