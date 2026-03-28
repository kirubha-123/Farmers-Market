const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MarketPrice = require('../models/MarketPrice');
const { CROP_DATA } = require('../data/cropPrices');

dotenv.config();

const MARKET_LIST = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Erode'];
const DAYS = 30;

function monthKeyFor(date) {
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return monthNames[date.getUTCMonth()];
}

function toUtcDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 5000
    });

    const ops = [];
    const today = new Date();

    for (let i = 0; i < DAYS; i += 1) {
      const dt = new Date(today);
      dt.setUTCDate(today.getUTCDate() - i);
      const date = toUtcDate(dt);
      const monthKey = monthKeyFor(date);

      Object.entries(CROP_DATA).forEach(([crop, config]) => {
        MARKET_LIST.forEach((market) => {
          const marketConfig = config.markets[market] || config.markets.default;
          if (!marketConfig) return;

          const baseline = Number(config.seasonal[monthKey] || marketConfig.avg || marketConfig.min);
          const drift = (Math.random() - 0.5) * 0.14; // +/- 7%
          const modal = Math.round(baseline * (1 + drift));

          const minPrice = clamp(Math.round(modal * 0.88), marketConfig.min, marketConfig.max);
          const maxPrice = clamp(Math.round(modal * 1.12), marketConfig.min, marketConfig.max);

          ops.push({
            updateOne: {
              filter: { market, crop, date },
              update: {
                $set: {
                  market,
                  state: 'Tamil Nadu',
                  crop,
                  date,
                  minPrice,
                  maxPrice,
                  modalPrice: clamp(modal, minPrice, maxPrice),
                  unit: config.unit || 'kg',
                  source: 'demo-seed'
                }
              },
              upsert: true
            }
          });
        });
      });
    }

    if (!ops.length) {
      console.log('No operations to seed.');
      return;
    }

    const result = await MarketPrice.bulkWrite(ops, { ordered: false });
    console.log('Demo market data seed complete:', {
      totalOps: ops.length,
      upserted: result.upsertedCount || 0,
      modified: result.modifiedCount || 0,
      matched: result.matchedCount || 0
    });
  } catch (err) {
    console.error('Demo seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
