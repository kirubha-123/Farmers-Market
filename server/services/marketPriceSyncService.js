const axios = require('axios');
const MarketPrice = require('../models/MarketPrice');

const DEFAULT_SCRAPE_MARKETS = [
  { slug: 'ariyalur', market: 'Ariyalur' },
  { slug: 'chengalpattu', market: 'Chengalpattu' },
  { slug: 'chennai', market: 'Chennai' },
  { slug: 'coimbatore', market: 'Coimbatore' },
  { slug: 'cuddalore', market: 'Cuddalore' },
  { slug: 'dharmapuri', market: 'Dharmapuri' },
  { slug: 'dindigul', market: 'Dindigul' },
  { slug: 'erode', market: 'Erode' },
  { slug: 'kallakurichi', market: 'Kallakurichi' },
  { slug: 'kanchipuram', market: 'Kanchipuram' },
  { slug: 'kanyakumari', market: 'Kanyakumari' },
  { slug: 'karur', market: 'Karur' },
  { slug: 'krishnagiri', market: 'Krishnagiri' },
  { slug: 'koyambedu', market: 'Koyambedu' },
  { slug: 'madurai', market: 'Madurai' },
  { slug: 'mayiladuthurai', market: 'Mayiladuthurai' },
  { slug: 'nagapattinam', market: 'Nagapattinam' },
  { slug: 'namakkal', market: 'Namakkal' },
  { slug: 'nilgiris', market: 'Nilgiris' },
  { slug: 'perambalur', market: 'Perambalur' },
  { slug: 'pollachi', market: 'Pollachi' },
  { slug: 'pudukkottai', market: 'Pudukkottai' },
  { slug: 'ramanathapuram', market: 'Ramanathapuram' },
  { slug: 'ranipet', market: 'Ranipet' },
  { slug: 'salem', market: 'Salem' },
  { slug: 'sivaganga', market: 'Sivaganga' },
  { slug: 'tenkasi', market: 'Tenkasi' },
  { slug: 'thanjavur', market: 'Thanjavur' },
  { slug: 'theni', market: 'Theni' },
  { slug: 'thoothukudi', market: 'Thoothukudi' },
  { slug: 'tiruchirappalli', market: 'Trichy' },
  { slug: 'tirunelveli', market: 'Tirunelveli' },
  { slug: 'tirupathur', market: 'Tirupathur' },
  { slug: 'tirupur', market: 'Tiruppur' },
  { slug: 'tiruvallur', market: 'Thiruvallur' },
  { slug: 'tiruvannamalai', market: 'Tiruvannamalai' },
  { slug: 'tiruvarur', market: 'Tiruvarur' },
  { slug: 'vellore', market: 'Vellore' },
  { slug: 'villupuram', market: 'Villupuram' },
  { slug: 'virudhunagar', market: 'Virudhunagar' }
];

const MARKET_NAME_OVERRIDES = {
  tiruchirappalli: 'Trichy',
  tirupur: 'Tiruppur',
  kanyakumari: 'Kanyakumari',
  dharmapuri: 'Dharmapuri',
  thoothukudi: 'Thoothukudi',
  nagapattinam: 'Nagapattinam',
  virudhunagar: 'Virudhunagar',
  ramanathapuram: 'Ramanathapuram',
  cuddalore: 'Cuddalore',
  villupuram: 'Villupuram',
  thiruvallur: 'Thiruvallur',
  nilgiris: 'Nilgiris'
};

const syncState = {
  enabled: false,
  feedUrl: process.env.MARKET_PRICE_FEED_URL || '',
  provider: 'none',
  intervalMinutes: Number(process.env.MARKET_SYNC_INTERVAL_MINUTES || 30),
  timerActive: false,
  lastRunAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastInsertedRows: 0,
  lastChangedRows: 0,
  lastUnchangedRows: 0,
  indexMigrated: false
};

let hasCheckedLegacyIndex = false;

function toTitleCase(value = '') {
  return value
    .toString()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugToMarketName(slug = '') {
  const normalized = slug.toLowerCase().trim();
  if (MARKET_NAME_OVERRIDES[normalized]) {
    return MARKET_NAME_OVERRIDES[normalized];
  }
  return toTitleCase(normalized.replace(/-/g, ' '));
}

function normalizeDate(dateLike) {
  if (!dateLike) {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  }

  const dt = new Date(`${dateLike}T00:00:00.000Z`);
  if (Number.isNaN(dt.getTime())) {
    const fallback = new Date();
    return new Date(Date.UTC(fallback.getUTCFullYear(), fallback.getUTCMonth(), fallback.getUTCDate()));
  }

  return dt;
}

function normalizeRows(rawRows = []) {
  return rawRows
    .filter((row) => row && row.market && row.crop)
    .map((row) => ({
      market: toTitleCase(row.market),
      state: row.state || 'Tamil Nadu',
      crop: toTitleCase(row.crop),
      date: normalizeDate(row.date),
      minPrice: Number(row.minPrice || 0),
      maxPrice: Number(row.maxPrice || 0),
      modalPrice: Number(row.modalPrice || 0),
      unit: row.unit || 'kg',
      source: row.source || 'remote-feed'
    }))
    .filter((row) => row.minPrice >= 0 && row.maxPrice >= 0 && row.modalPrice >= 0);
}

function toDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function makeSnapshotKey(row) {
  return `${row.market}|${row.crop}|${toDateKey(row.date)}`;
}

function hasRowChanged(previousRow, nextRow) {
  if (!previousRow) return true;

  return (
    Number(previousRow.minPrice) !== Number(nextRow.minPrice) ||
    Number(previousRow.maxPrice) !== Number(nextRow.maxPrice) ||
    Number(previousRow.modalPrice) !== Number(nextRow.modalPrice) ||
    String(previousRow.unit || '') !== String(nextRow.unit || '')
  );
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

async function ensureLegacyIndexDropped() {
  if (hasCheckedLegacyIndex) return;

  try {
    const indexes = await MarketPrice.collection.indexes();
    const legacy = indexes.find((idx) => idx.name === 'market_1_crop_1_date_1' && idx.unique);

    if (legacy) {
      await MarketPrice.collection.dropIndex('market_1_crop_1_date_1');
      console.log('MarketPrice: dropped legacy unique index market_1_crop_1_date_1');
    }

    syncState.indexMigrated = true;
    hasCheckedLegacyIndex = true;
  } catch (err) {
    console.warn(`MarketPrice index migration skipped: ${err.message}`);
    hasCheckedLegacyIndex = true;
  }
}

async function getLatestRowsForDate(dateValue) {
  const { start, end } = startAndEndOfDate(dateValue);

  const docs = await MarketPrice.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    { $sort: { observedAt: -1, updatedAt: -1 } },
    {
      $group: {
        _id: { market: '$market', crop: '$crop', date: '$date' },
        latest: { $first: '$$ROOT' }
      }
    }
  ]);

  const latestByKey = new Map();
  docs.forEach((entry) => {
    const row = entry.latest;
    latestByKey.set(makeSnapshotKey(row), row);
  });

  return latestByKey;
}

function decodeHtml(html = '') {
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(value = '') {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumbers(text = '') {
  return (text.match(/\d+(?:\.\d+)?/g) || [])
    .map((n) => Number(n.replace(/,/g, '')))
    .filter((n) => Number.isFinite(n));
}

function parseUnitFromText(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('quintal')) return 'quintal';
  if (lower.includes('dozen')) return 'dozen';
  if (lower.includes('100 nut')) return '100 nuts';
  if (lower.includes('kg')) return 'kg';
  return 'kg';
}

function parseTableRowsFromHtml(html, marketName) {
  const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const date = normalizeDate();
  const rows = [];

  rowMatches.forEach((rowHtml) => {
    const cellMatches = rowHtml.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || [];
    if (cellMatches.length < 2) return;

    const cells = cellMatches.map((c) => stripTags(c)).filter(Boolean);
    if (!cells.length) return;

    const cropRaw = cells[0];
    const crop = toTitleCase(cropRaw.replace(/\([^\)]*\)/g, '').trim());
    if (!crop || crop.length < 2) return;

    const numericText = cells.slice(1).join(' ');
    const values = extractNumbers(numericText);
    if (!values.length) return;

    let minPrice = values[0];
    let modalPrice = values[0];
    let maxPrice = values[0];

    if (values.length >= 3) {
      const sorted = [...values].sort((a, b) => a - b);
      minPrice = sorted[0];
      modalPrice = sorted[1];
      maxPrice = sorted[2];
    } else if (values.length === 2) {
      minPrice = Math.min(values[0], values[1]);
      maxPrice = Math.max(values[0], values[1]);
      modalPrice = Math.round((minPrice + maxPrice) / 2);
    }

    if (maxPrice < minPrice) return;

    rows.push({
      market: marketName,
      state: 'Tamil Nadu',
      crop,
      date,
      minPrice,
      maxPrice,
      modalPrice,
      unit: parseUnitFromText(rowHtml),
      source: 'vegetablemarketprice-scrape'
    });
  });

  const dedup = new Map();
  rows.forEach((row) => {
    dedup.set(`${row.market}-${row.crop}-${row.date.toISOString().slice(0, 10)}`, row);
  });

  return [...dedup.values()];
}

async function discoverTamilNaduMarkets(baseUrl, timeout) {
  const discoveryUrl = `${baseUrl}/market/tamilnadu/today`;

  const response = await axios.get(discoveryUrl, {
    timeout,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FarmersMarketBot/1.0; +https://localhost)'
    }
  });

  const html = String(response.data || '');
  const slugMatches = [...html.matchAll(/href=["']\/market\/([a-z0-9-]+)\/today["']/gi)]
    .map((m) => m[1])
    .filter(Boolean);

  const uniqueSlugs = [...new Set(slugMatches)]
    .map((s) => s.toLowerCase())
    .filter((s) => s !== 'tamilnadu');

  return uniqueSlugs.map((slug) => ({
    slug,
    market: slugToMarketName(slug)
  }));
}

async function getScrapeMarketsFromEnv(baseUrl, timeout) {
  const custom = (process.env.MARKET_SCRAPE_MARKETS || '').trim();
  if (custom) {
    const slugs = custom.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length) {
      return slugs.map((slug) => ({ slug, market: slugToMarketName(slug) }));
    }
  }

  const discoveryEnabled = String(process.env.MARKET_SCRAPE_DISCOVER || 'true').toLowerCase() === 'true';
  if (!discoveryEnabled) {
    return DEFAULT_SCRAPE_MARKETS;
  }

  try {
    const discovered = await discoverTamilNaduMarkets(baseUrl, timeout);
    if (!discovered.length) {
      return DEFAULT_SCRAPE_MARKETS;
    }

    const maxMarkets = Math.max(1, Number(process.env.MARKET_SCRAPE_MAX_MARKETS || 120));
    return discovered.slice(0, maxMarkets);
  } catch (err) {
    console.warn(`Market discovery failed, using defaults: ${err.message}`);
    return DEFAULT_SCRAPE_MARKETS;
  }
}

async function fetchRowsFromScrape() {
  const baseUrl = (process.env.MARKET_SCRAPE_BASE_URL || 'https://vegetablemarketprice.com').replace(/\/$/, '');
  const scrapeEnabled = String(process.env.MARKET_SCRAPE_ENABLED || 'true').toLowerCase() === 'true';
  if (!scrapeEnabled) return [];

  const timeout = Number(process.env.MARKET_SYNC_TIMEOUT_MS || 15000);
  const targets = await getScrapeMarketsFromEnv(baseUrl, timeout);
  const allRows = [];

  for (const target of targets) {
    const url = `${baseUrl}/market/${target.slug}/today`;

    try {
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FarmersMarketBot/1.0; +https://localhost)'
        }
      });

      const html = String(response.data || '');
      const rows = parseTableRowsFromHtml(html, target.market);
      allRows.push(...rows);
    } catch (err) {
      console.warn(`Scrape skipped for ${target.slug}: ${err.message}`);
    }
  }

  return allRows;
}

async function fetchRowsFromConfiguredSource() {
  const feedUrl = process.env.MARKET_PRICE_FEED_URL || '';

  if (feedUrl) {
    const response = await axios.get(feedUrl, {
      timeout: Number(process.env.MARKET_SYNC_TIMEOUT_MS || 15000)
    });

    const payload = response.data;
    const rows = Array.isArray(payload) ? payload : (payload?.rows || []);
    return {
      provider: 'json-feed',
      rows: normalizeRows(rows),
      receivedRows: Array.isArray(rows) ? rows.length : 0
    };
  }

  const scrapedRows = await fetchRowsFromScrape();
  return {
    provider: 'web-scrape',
    rows: normalizeRows(scrapedRows),
    receivedRows: scrapedRows.length
  };
}

async function syncMarketPrices({ reason = 'manual' } = {}) {
  const feedUrl = process.env.MARKET_PRICE_FEED_URL || '';
  syncState.feedUrl = feedUrl;
  syncState.provider = feedUrl ? 'json-feed' : 'web-scrape';
  syncState.intervalMinutes = Number(process.env.MARKET_SYNC_INTERVAL_MINUTES || 30);
  syncState.lastRunAt = new Date().toISOString();

  try {
    await ensureLegacyIndexDropped();

    const sourceResult = await fetchRowsFromConfiguredSource();
    const normalizedRows = sourceResult.rows;
    syncState.provider = sourceResult.provider;

    if (!normalizedRows.length) {
      syncState.lastError = 'No valid rows found from configured source';
      return {
        success: false,
        message: syncState.lastError,
        provider: sourceResult.provider,
        receivedRows: sourceResult.receivedRows
      };
    }

    const rowsByDate = normalizedRows.reduce((acc, row) => {
      const key = toDateKey(row.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    const latestByKey = new Map();
    const dateKeys = Object.keys(rowsByDate);
    for (const dateKey of dateKeys) {
      const dateLatestMap = await getLatestRowsForDate(new Date(`${dateKey}T00:00:00.000Z`));
      dateLatestMap.forEach((value, key) => latestByKey.set(key, value));
    }

    const now = new Date();
    const changedRows = [];
    let unchangedRows = 0;

    normalizedRows.forEach((row) => {
      const key = makeSnapshotKey(row);
      const previous = latestByKey.get(key);

      if (hasRowChanged(previous, row)) {
        changedRows.push({
          ...row,
          observedAt: now
        });
      } else {
        unchangedRows += 1;
      }
    });

    let inserted = 0;
    if (changedRows.length > 0) {
      const insertResult = await MarketPrice.insertMany(changedRows, { ordered: false });
      inserted = insertResult.length;
    }

    syncState.lastSuccessAt = new Date().toISOString();
    syncState.lastError = null;
    syncState.lastInsertedRows = inserted;
    syncState.lastChangedRows = changedRows.length;
    syncState.lastUnchangedRows = unchangedRows;

    return {
      success: true,
      reason,
      provider: sourceResult.provider,
      totalRows: normalizedRows.length,
      changedRows: changedRows.length,
      unchangedRows,
      inserted,
      lastSuccessAt: syncState.lastSuccessAt
    };
  } catch (err) {
    syncState.lastError = err.message;
    return {
      success: false,
      message: err.message
    };
  }
}

function getMarketSyncState() {
  return { ...syncState };
}

function startMarketPriceScheduler() {
  const enabled = String(process.env.MARKET_SYNC_ENABLED || 'true').toLowerCase() === 'true';
  syncState.enabled = enabled;

  if (!enabled) {
    console.log('Market sync scheduler: disabled (MARKET_SYNC_ENABLED=false)');
    return null;
  }

  const intervalMinutes = Number(process.env.MARKET_SYNC_INTERVAL_MINUTES || 30);
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
  syncState.intervalMinutes = intervalMinutes;

  console.log(`Market sync scheduler: enabled, interval=${intervalMinutes} min`);

  syncMarketPrices({ reason: 'startup' })
    .then((result) => {
      if (result.success) {
        console.log(`Market sync startup complete: ${result.totalRows} rows`);
      } else {
        console.warn(`Market sync startup skipped: ${result.message}`);
      }
    })
    .catch((err) => {
      console.warn('Market sync startup error:', err.message);
    });

  const timer = setInterval(async () => {
    const result = await syncMarketPrices({ reason: 'schedule' });
    if (result.success) {
      console.log(`Market sync scheduled complete: ${result.totalRows} rows`);
    } else {
      console.warn(`Market sync scheduled failed: ${result.message}`);
    }
  }, intervalMs);

  syncState.timerActive = true;
  return timer;
}

module.exports = {
  syncMarketPrices,
  getMarketSyncState,
  startMarketPriceScheduler
};
