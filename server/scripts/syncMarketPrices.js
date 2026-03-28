const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { syncMarketPrices } = require('../services/marketPriceSyncService');

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 5000
    });

    const result = await syncMarketPrices({ reason: 'script' });

    if (!result.success) {
      console.error('Sync failed:', result.message);
      process.exitCode = 1;
      return;
    }

    console.log('Sync complete:', result);
  } catch (err) {
    console.error('Sync script error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
