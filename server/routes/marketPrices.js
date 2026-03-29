const express = require('express');
const router = express.Router();

const MarketPrice = require('../models/MarketPrice');
const adminAuth = require('../middleware/adminMiddleware');
const { CROP_DATA } = require('../data/cropPrices');
const { syncMarketPrices, getMarketSyncState } = require('../services/marketPriceSyncService');

const TAMIL_NADU_MARKETS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Koyambedu', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pollachi', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
  'Trichy', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Thiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Villupuram', 'Virudhunagar'
];

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function toTitleCase(value = '') {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseISODate(input) {
  if (!input) {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  const date = new Date(`${input}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startAndEndOfDate(inputDate) {
  const start = new Date(Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate()
  ));

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function getFallbackMarkets() {
  const markets = new Set();

  Object.values(CROP_DATA).forEach((cropConfig) => {
    Object.keys(cropConfig.markets || {}).forEach((marketName) => {
      if (marketName !== 'default') {
        markets.add(marketName);
      }
    });
  });

  if (!markets.size) {
    markets.add('Chennai');
  }

  TAMIL_NADU_MARKETS.forEach((m) => markets.add(m));

  return [...markets].sort((a, b) => a.localeCompare(b));
}

function getFallbackRow(cropName, marketName, date) {
  const cropData = CROP_DATA[cropName];
  if (!cropData) return null;

  const market = cropData.markets[marketName] || cropData.markets.default;
  const monthKey = MONTH_NAMES[date.getUTCMonth()];
  const modalPrice = cropData.seasonal[monthKey] || market.avg;

  return {
    market: marketName,
    crop: cropName,
    date: date.toISOString().slice(0, 10),
    minPrice: market.min,
    maxPrice: market.max,
    modalPrice,
    unit: cropData.unit,
    source: 'fallback-static-dataset'
  };
}

function buildFallbackToday(marketName, date) {
  return Object.keys(CROP_DATA)
    .map((cropName) => getFallbackRow(cropName, marketName, date))
    .filter(Boolean)
    .sort((a, b) => a.crop.localeCompare(b.crop));
}

function enumerateDates(from, to) {
  const allDates = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    allDates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return allDates;
}

function normalizeDbRecord(doc) {
  return {
    market: doc.market,
    crop: doc.crop,
    date: doc.date.toISOString().slice(0, 10),
    observedAt: doc.observedAt ? new Date(doc.observedAt).toISOString() : new Date(doc.updatedAt).toISOString(),
    minPrice: doc.minPrice,
    maxPrice: doc.maxPrice,
    modalPrice: doc.modalPrice,
    unit: doc.unit,
    source: doc.source || 'manual',
    updatedAt: doc.updatedAt
  };
}

router.get('/markets', async (req, res) => {
  try {
    const dbMarkets = await MarketPrice.distinct('market');
    const fallbackMarkets = getFallbackMarkets();

    const marketSet = new Set([...dbMarkets, ...fallbackMarkets].map((name) => toTitleCase(name)));
    const markets = [...marketSet].sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      markets,
      total: markets.length
    });
  } catch (err) {
    console.error('Market list error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch markets' });
  }
});

router.get('/crops', async (req, res) => {
  try {
    const market = toTitleCase(req.query.market || '');
    let dbCrops = [];

    if (market) {
      dbCrops = await MarketPrice.distinct('crop', { market });
    } else {
      dbCrops = await MarketPrice.distinct('crop');
    }

    const fallbackCrops = Object.keys(CROP_DATA);
    const cropSet = new Set([...dbCrops, ...fallbackCrops].map((name) => toTitleCase(name)));
    const crops = [...cropSet].sort((a, b) => a.localeCompare(b));

    res.json({
      success: true,
      crops,
      total: crops.length
    });
  } catch (err) {
    console.error('Crop list error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch crops' });
  }
});

router.get('/today', async (req, res) => {
  try {
    const market = toTitleCase(req.query.market || 'Chennai');
    const parsedDate = parseISODate(req.query.date);

    if (!parsedDate) {
      return res.status(400).json({ success: false, message: 'Invalid date. Use YYYY-MM-DD' });
    }

    const { start, end } = startAndEndOfDate(parsedDate);

    const docs = await MarketPrice.aggregate([
      { $match: { market, date: { $gte: start, $lt: end } } },
      { $sort: { observedAt: -1, updatedAt: -1 } },
      {
        $group: {
          _id: { market: '$market', crop: '$crop' },
          latest: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest' } },
      { $sort: { crop: 1 } }
    ]);

    let rows;
    let source;
    let lastUpdated;

    if (docs.length > 0) {
      rows = docs.map(normalizeDbRecord);
      source = 'database';
      lastUpdated = new Date(Math.max(...docs.map((doc) => new Date(doc.updatedAt).getTime()))).toISOString();
    } else {
      rows = buildFallbackToday(market, parsedDate);
      source = 'fallback-static-dataset';
      lastUpdated = new Date().toISOString();
    }

    res.json({
      success: true,
      market,
      date: parsedDate.toISOString().slice(0, 10),
      source,
      lastUpdated,
      total: rows.length,
      rows
    });
  } catch (err) {
    console.error('Today price error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch today prices' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const market = toTitleCase(req.query.market || 'Chennai');
    const crop = toTitleCase(req.query.crop || '');

    if (!crop) {
      return res.status(400).json({ success: false, message: 'crop is required' });
    }

    const toDate = parseISODate(req.query.to) || parseISODate();
    const fromDate = parseISODate(req.query.from) || new Date(toDate.getTime());

    if (!req.query.from) {
      fromDate.setUTCDate(fromDate.getUTCDate() - 14);
    }

    if (!toDate || !fromDate) {
      return res.status(400).json({ success: false, message: 'Invalid from/to date. Use YYYY-MM-DD' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ success: false, message: 'from date must be before to date' });
    }

    const days = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 90) {
      return res.status(400).json({ success: false, message: 'Date range cannot exceed 90 days' });
    }

    const docs = await MarketPrice.find({
      market,
      crop,
      date: {
        $gte: startAndEndOfDate(fromDate).start,
        $lt: startAndEndOfDate(toDate).end
      }
    }).sort({ date: 1, observedAt: 1, updatedAt: 1 });

    let series;
    let source;
    const granularity = String(req.query.granularity || 'daily').toLowerCase();

    if (docs.length > 0) {
      if (granularity === 'intraday') {
        series = docs.map((doc) => ({
          ...normalizeDbRecord(doc),
          date: (doc.observedAt || doc.updatedAt).toISOString()
        }));
      } else {
        const byDate = new Map();
        docs.forEach((doc) => {
          const key = doc.date.toISOString().slice(0, 10);
          byDate.set(key, normalizeDbRecord(doc));
        });
        series = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
      }
      source = 'database';
    } else {
      series = enumerateDates(fromDate, toDate)
        .map((date) => getFallbackRow(crop, market, date))
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date));
      source = 'fallback-static-dataset';
    }

    res.json({
      success: true,
      market,
      crop,
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
      source,
      total: series.length,
      series
    });
  } catch (err) {
    console.error('History price error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch history prices' });
  }
});

router.get('/sync/status', async (req, res) => {
  try {
    const state = getMarketSyncState();
    res.json({ success: true, sync: state });
  } catch (err) {
    console.error('Sync status error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch sync status' });
  }
});

router.post('/sync/now', adminAuth, async (req, res) => {
  try {
    const result = await syncMarketPrices({ reason: 'manual-api' });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Manual sync error:', err.message);
    return res.status(500).json({ success: false, message: 'Manual sync failed' });
  }
});

router.post('/admin/bulk', adminAuth, async (req, res) => {
  try {
    const { market, state, date, source, prices } = req.body;

    if (!market || !date || !Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'market, date and non-empty prices[] are required'
      });
    }

    const parsedDate = parseISODate(date);
    if (!parsedDate) {
      return res.status(400).json({ success: false, message: 'Invalid date. Use YYYY-MM-DD' });
    }

    const normalizedMarket = toTitleCase(market);
    const rows = prices
      .filter((item) => item && item.crop)
      .map((item) => ({
        market: normalizedMarket,
        state: state || 'Tamil Nadu',
        crop: toTitleCase(item.crop),
        date: parsedDate,
        observedAt: new Date(),
        minPrice: Number(item.minPrice || 0),
        maxPrice: Number(item.maxPrice || 0),
        modalPrice: Number(item.modalPrice || 0),
        unit: item.unit || 'kg',
        source: source || 'manual-upload'
      }));

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'No valid crop rows in prices[]' });
    }

    const inserted = await MarketPrice.insertMany(rows, { ordered: false });

    res.json({
      success: true,
      message: 'Market prices saved',
      inserted: inserted.length,
      totalRows: rows.length
    });
  } catch (err) {
    console.error('Bulk ingest error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to ingest market prices' });
  }
});

module.exports = router;
