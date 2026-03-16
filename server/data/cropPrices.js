/**
 * 🌾 Tamil Nadu Crop Price Dataset
 * Source: Based on Agmarknet / TNAU published mandi prices (2024-2026)
 * Markets: Koyambedu (Chennai), Madurai, Coimbatore, Salem, Tirchy, Vellore
 */

const CROP_DATA = {
  Tomato: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 18, max: 65, avg: 38 },
      Madurai:    { min: 15, max: 55, avg: 32 },
      Coimbatore: { min: 16, max: 60, avg: 35 },
      Salem:      { min: 14, max: 50, avg: 30 },
      Trichy:     { min: 17, max: 58, avg: 34 },
      default:    { min: 16, max: 58, avg: 34 },
    },
    seasonal: { jan:40, feb:35, mar:28, apr:25, may:22, jun:30, jul:38, aug:45, sep:55, oct:60, nov:50, dec:42 },
    trend: '+12%',
    advice: 'Peak demand during Oct-Nov. Store in cool conditions. Koyambedu wholesale hub open 24h.',
    adviceTa: 'அக்டோபர்-நவம்பர் மாதங்களில் அதிக தேவை. குளிர்ந்த இடத்தில் சேமிக்கவும்.'
  },
  Onion: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 20, max: 80, avg: 45 },
      Madurai:    { min: 18, max: 70, avg: 40 },
      Coimbatore: { min: 19, max: 75, avg: 42 },
      Salem:      { min: 17, max: 65, avg: 38 },
      Trichy:     { min: 20, max: 72, avg: 43 },
      default:    { min: 19, max: 74, avg: 42 },
    },
    seasonal: { jan:35, feb:30, mar:25, apr:28, may:40, jun:55, jul:65, aug:70, sep:60, oct:45, nov:38, dec:32 },
    trend: '+18%',
    advice: 'Prices surge June-August due to monsoon disruptions on supply from Nasik. Sell before June.',
    adviceTa: 'ஜூன்-ஆகஸ்ட் மாதங்களில் விலை அதிகரிக்கும். ஜூன்க்கு முன் விற்கவும்.'
  },
  Rice: {
    unit: 'quintal',
    markets: {
      Chennai:    { min: 2200, max: 3500, avg: 2800 },
      Madurai:    { min: 2000, max: 3200, avg: 2600 },
      Trichy:     { min: 2100, max: 3300, avg: 2700 },
      Thanjavur:  { min: 1900, max: 3000, avg: 2500 },
      default:    { min: 2000, max: 3300, avg: 2650 },
    },
    seasonal: { jan:2600, feb:2500, mar:2400, apr:2600, may:2700, jun:2800, jul:2900, aug:3000, sep:2800, oct:2500, nov:2400, dec:2600 },
    trend: '+5%',
    advice: 'Kharif harvest (Nov-Dec) brings prices down. Rabi harvest (Apr-May) pushes prices up.',
    adviceTa: 'கரிஃப் அறுவடையில் விலை குறையும். ரபி அறுவடை காலத்தில் விலை உயரும்.'
  },
  Potato: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 18, max: 55, avg: 32 },
      Coimbatore: { min: 15, max: 48, avg: 28 },
      Salem:      { min: 14, max: 45, avg: 26 },
      Nilgiris:   { min: 12, max: 40, avg: 24 },
      default:    { min: 15, max: 50, avg: 28 },
    },
    seasonal: { jan:28, feb:24, mar:20, apr:22, may:25, jun:30, jul:35, aug:40, sep:38, oct:32, nov:28, dec:26 },
    trend: '+8%',
    advice: 'Ooty and Kodaikanal supply Tamil Nadu. Best prices in Jul-Sep.',
    adviceTa: 'ஊட்டி மற்றும் கொடைக்கானல் விரதம் வழங்குகின்றன. ஜூலை-செப்டம்பரில் சிறந்த விலை.'
  },
  Cabbage: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 10, max: 35, avg: 20 },
      Coimbatore: { min: 8, max: 28, avg: 16 },
      default:    { min: 9, max: 30, avg: 18 },
    },
    seasonal: { jan:18, feb:15, mar:12, apr:14, may:18, jun:22, jul:25, aug:28, sep:25, oct:20, nov:18, dec:16 },
    trend: '+6%',
    advice: 'Winter months (Dec-Feb) show stable prices. Suitable for cold storage before peak summer.',
    adviceTa: 'குளிர் மாதங்களில் நிலையான விலை. கோடை கடையில் சேமிக்கலாம்.'
  },
  Banana: {
    unit: 'dozen',
    markets: {
      Chennai:    { min: 25, max: 80, avg: 48 },
      Madurai:    { min: 22, max: 70, avg: 42 },
      Trichy:     { min: 20, max: 68, avg: 40 },
      default:    { min: 22, max: 75, avg: 44 },
    },
    seasonal: { jan:48, feb:45, mar:50, apr:55, may:60, jun:58, jul:55, aug:50, sep:48, oct:45, nov:50, dec:52 },
    trend: '+10%',
    advice: 'Festival seasons (Pongal, Diwali) spike demand by 20-30%. Thiruvarur and Thanjavur major supply areas.',
    adviceTa: 'பொங்கல், தீபாவளி காலங்களில் 20-30% தேவை அதிகரிக்கும்.'
  },
  Sugarcane: {
    unit: 'ton',
    markets: {
      Chennai:    { min: 2900, max: 3500, avg: 3200 },
      Coimbatore: { min: 2800, max: 3400, avg: 3100 },
      Vellore:    { min: 2750, max: 3350, avg: 3050 },
      default:    { min: 2800, max: 3400, avg: 3100 },
    },
    seasonal: { jan:3200, feb:3100, mar:3000, apr:3100, may:3200, jun:3300, jul:3200, aug:3100, sep:3000, oct:3100, nov:3200, dec:3300 },
    trend: '+3%',
    advice: 'Government Fair Remunerative Price (FRP) set at ₹3150/ton for 2025-26 season.',
    adviceTa: 'அரசு நியாயமான விலை 2025-26க்காக ₹3150/டன் நிர்ணயிக்கப்பட்டுள்ளது.'
  },
  Cotton: {
    unit: 'quintal',
    markets: {
      Vellore:    { min: 6500, max: 8800, avg: 7600 },
      Coimbatore: { min: 6800, max: 9000, avg: 7800 },
      Salem:      { min: 6600, max: 8600, avg: 7500 },
      default:    { min: 6600, max: 8800, avg: 7600 },
    },
    seasonal: { jan:7500, feb:7400, mar:7200, apr:7300, may:7500, jun:7700, jul:8000, aug:8200, sep:8400, oct:8200, nov:7800, dec:7600 },
    trend: '+7%',
    advice: 'MSP for Cotton 2025-26: ₹7121/quintal (Medium Staple). Sell after October for peak prices.',
    adviceTa: 'பருத்தியின் MSP ₹7121/குவிண்டால். அக்டோபருக்குப் பிறகு விற்றால் சிறந்த விலை.'
  },
  Groundnut: {
    unit: 'quintal',
    markets: {
      Vellore:    { min: 5200, max: 7000, avg: 6100 },
      Tiruppur:   { min: 5000, max: 6800, avg: 5900 },
      Salem:      { min: 5100, max: 6900, avg: 6000 },
      default:    { min: 5100, max: 6900, avg: 6000 },
    },
    seasonal: { jan:6000, feb:5800, mar:5600, apr:5800, may:6000, jun:6200, jul:6400, aug:6500, sep:6600, oct:6500, nov:6200, dec:6000 },
    trend: '+9%',
    advice: 'MSP 2025-26: ₹6377/quintal. Vellore and Ranipet districts are major growing zones.',
    adviceTa: 'MSP: ₹6377/குவிண்டால். வேலூர் மற்றும் ராணிப்பேட் மாவட்டங்கள் பெரிய உற்பத்தி பகுதிகள்.'
  },
  Turmeric: {
    unit: 'quintal',
    markets: {
      Erode:      { min: 7000, max: 16000, avg: 11000 },
      Salem:      { min: 6800, max: 15000, avg: 10500 },
      default:    { min: 7000, max: 15500, avg: 10800 },
    },
    seasonal: { jan:11000, feb:10500, mar:10000, apr:10500, may:11000, jun:12000, jul:13000, aug:14000, sep:15000, oct:14000, nov:12500, dec:11500 },
    trend: '+22%',
    advice: 'Erode is Asia\'s largest turmeric trading hub. Prices high in Aug-Oct due to festival demand.',
    adviceTa: 'ஈரோடு ஆசியாவிலேயே மிகப்பெரிய மஞ்சள் வர்த்தக மையம். ஆகஸ்ட்-அக்டோபரில் விலை உயர்வு.'
  },
  Chilli: {
    unit: 'quintal',
    markets: {
      Madurai:    { min: 8000, max: 22000, avg: 14000 },
      Ramanathapuram: { min: 7500, max: 20000, avg: 13000 },
      default:    { min: 8000, max: 21000, avg: 13500 },
    },
    seasonal: { jan:14000, feb:13000, mar:12000, apr:13000, may:14000, jun:16000, jul:18000, aug:20000, sep:19000, oct:17000, nov:15000, dec:14000 },
    trend: '+15%',
    advice: 'Dry red chilli prices volatile. Export to Sri Lanka and Malaysia boosts prices Jul-Sep.',
    adviceTa: 'உலர் சிவப்பு மிளகாய் விலை ஏற்ற இறக்கமாக உள்ளது. ஜூலை-செப்டம்பரில் ஏற்றுமதி தேவை அதிகரிக்கும்.'
  },
  Coconut: {
    unit: '100 nuts',
    markets: {
      Coimbatore: { min: 1200, max: 2800, avg: 2000 },
      Pollachi:   { min: 1100, max: 2700, avg: 1900 },
      Tiruppur:   { min: 1200, max: 2800, avg: 2000 },
      default:    { min: 1200, max: 2700, avg: 1950 },
    },
    seasonal: { jan:2000, feb:1900, mar:1800, apr:2000, may:2200, jun:2400, jul:2600, aug:2700, sep:2600, oct:2400, nov:2200, dec:2100 },
    trend: '+11%',
    advice: 'Pollachi is the coconut trading capital of Tamil Nadu. Summer prices highest due to juice demand.',
    adviceTa: 'பொள்ளாச்சி தமிழ்நாட்டின் தேங்காய் வர்த்தக தலைமையகம். கோடையில் விலை அதிகம்.'
  },
  Brinjal: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 12, max: 45, avg: 25 },
      Madurai:    { min: 10, max: 40, avg: 22 },
      default:    { min: 11, max: 42, avg: 23 },
    },
    seasonal: { jan:25, feb:22, mar:18, apr:20, may:22, jun:28, jul:32, aug:38, sep:35, oct:30, nov:26, dec:23 },
    trend: '+8%',
    advice: 'High perishability. Sell within 2 days of harvest. Local mandis preferred over distance markets.',
    adviceTa: 'விரைவில் கெட்டுவிடும். அறுவடை செய்த 2 நாட்களுக்குள் விற்கவும்.'
  },
  Cauliflower: {
    unit: 'kg',
    markets: {
      Chennai:    { min: 14, max: 50, avg: 28 },
      Coimbatore: { min: 12, max: 44, avg: 24 },
      default:    { min: 13, max: 46, avg: 26 },
    },
    seasonal: { jan:22, feb:18, mar:15, apr:17, may:20, jun:26, jul:30, aug:35, sep:32, oct:28, nov:24, dec:20 },
    trend: '+9%',
    advice: 'Winter vegetable — best yields Oct-Feb. Coimbatore foothills supply major cities.',
    adviceTa: 'குளிர்கால காய்கறி — சிறந்த விளைச்சல் அக்டோபர்-பிப்ரவரி. கோவை மலைப்பிரதேசம் பெரு நகரங்களுக்கு வழங்குகிறது.'
  },
};

/**
 * Get price prediction for a crop + location
 */
function getPricePrediction(cropName, location) {
  const month = new Date().getMonth(); // 0-11
  const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const currentMonth = monthNames[month];
  const nextMonth    = monthNames[(month + 1) % 12];
  const prevMonth    = monthNames[(month + 11) % 12];

  // Find crop (case-insensitive)
  const key = Object.keys(CROP_DATA).find(k => k.toLowerCase() === cropName?.toLowerCase());
  if (!key) return null;

  const data = CROP_DATA[key];
  const market = data.markets[location] || data.markets.default;

  const currentPrice  = data.seasonal[currentMonth] || market.avg;
  const nextPrice     = data.seasonal[nextMonth]    || market.avg;
  const prevPrice     = data.seasonal[prevMonth]    || market.avg;

  const trendPct = (((nextPrice - currentPrice) / currentPrice) * 100).toFixed(1);
  const trendDir = trendPct > 0 ? '📈 Rising' : trendPct < 0 ? '📉 Falling' : '➡️ Stable';

  return {
    crop:           key,
    location:       location || 'Tamil Nadu',
    unit:           data.unit,
    currentPrice:   currentPrice,
    predictedPrice: nextPrice,
    previousPrice:  prevPrice,
    marketRange:    `₹${market.min} – ₹${market.max}`,
    trend:          data.trend,
    trendDirection: trendDir,
    trendPercent:   `${trendPct > 0 ? '+' : ''}${trendPct}% next month`,
    recommendation: parseFloat(trendPct) > 3
      ? `🟢 Hold! Price expected to rise ${trendPct}% next month. ${data.advice}`
      : parseFloat(trendPct) < -3
        ? `🔴 Sell now! Price expected to fall ${Math.abs(trendPct)}% next month. ${data.advice}`
        : `🟡 Market is stable. ${data.advice}`,
    recommendationTa: data.adviceTa,
    historicalData: monthNames.slice(0, 6).map((m, i) => ({
      date: new Date(new Date().setMonth(month - 5 + i)).toLocaleDateString('en-IN', { month: 'short' }),
      price: data.seasonal[m] || market.avg
    }))
  };
}

module.exports = { CROP_DATA, getPricePrediction };
