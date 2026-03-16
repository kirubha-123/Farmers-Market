const express = require('express');
const router = express.Router();
const { getPricePrediction, CROP_DATA } = require('../data/cropPrices');

// Bilingual crop name mapping (Tamil → English)
const CROP_MAP = {
  'தக்காளி': 'Tomato', 'thakkali': 'Tomato', 'tomato': 'Tomato',
  'வெங்காயம்': 'Onion', 'vengayam': 'Onion', 'onion': 'Onion',
  'அரிசி': 'Rice', 'arisi': 'Rice', 'rice': 'Rice', 'paddy': 'Rice',
  'உருளைக்கிழங்கு': 'Potato', 'urulai': 'Potato', 'potato': 'Potato',
  'முட்டைக்கோஸ்': 'Cabbage', 'muttaikose': 'Cabbage', 'cabbage': 'Cabbage',
  'வாழைப்பழம்': 'Banana', 'vaazhai': 'Banana', 'banana': 'Banana',
  'கரும்பு': 'Sugarcane', 'sugarcane': 'Sugarcane',
  'பருத்தி': 'Cotton', 'paruthi': 'Cotton', 'cotton': 'Cotton',
  'வேர்க்கடலை': 'Groundnut', 'verkadalai': 'Groundnut', 'groundnut': 'Groundnut',
  'மஞ்சள்': 'Turmeric', 'manjal': 'Turmeric', 'turmeric': 'Turmeric',
  'மிளகாய்': 'Chilli', 'milagai': 'Chilli', 'chilli': 'Chilli', 'chili': 'Chilli',
  'தேங்காய்': 'Coconut', 'thengai': 'Coconut', 'coconut': 'Coconut',
  'கத்திரிக்காய்': 'Brinjal', 'kathirikkai': 'Brinjal', 'brinjal': 'Brinjal', 'eggplant': 'Brinjal',
  'காலிஃபிளவர்': 'Cauliflower', 'cauliflower': 'Cauliflower',
};

// Location mapping
const LOCATION_MAP = {
  'chennai': 'Chennai', 'சென்னை': 'Chennai',
  'madurai': 'Madurai', 'மதுரை': 'Madurai',
  'coimbatore': 'Coimbatore', 'கோயம்புத்தூர்': 'Coimbatore', 'kovai': 'Coimbatore',
  'salem': 'Salem', 'சேலம்': 'Salem',
  'trichy': 'Trichy', 'திருச்சி': 'Trichy', 'tiruchirappalli': 'Trichy',
  'vellore': 'Vellore', 'வேலூர்': 'Vellore',
  'erode': 'Erode', 'ஈரோடு': 'Erode',
  'thanjavur': 'Thanjavur', 'தஞ்சாவூர்': 'Thanjavur',
  'tiruppur': 'Tiruppur', 'திருப்பூர்': 'Tiruppur',
  'pollachi': 'Pollachi',
};

function detectCropAndLocation(text) {
  const lower = text.toLowerCase();
  let crop = null;
  let location = null;

  for (const [key, val] of Object.entries(CROP_MAP)) {
    if (lower.includes(key)) { crop = val; break; }
  }
  for (const [key, val] of Object.entries(LOCATION_MAP)) {
    if (lower.includes(key)) { location = val; break; }
  }

  return { crop, location };
}

/**
 * POST /api/ai-price/answer
 * Body: { queryText, preferredLanguage }
 */
router.post('/answer', async (req, res) => {
  try {
    const { queryText, preferredLanguage } = req.body;
    if (!queryText) return res.status(400).json({ error: 'No query text provided' });

    const { crop, location } = detectCropAndLocation(queryText);

    if (!crop) {
      return res.json({
        success: false,
        error: 'Crop not detected',
        availableCrops: Object.keys(CROP_DATA).join(', '),
        message: `I could not detect a crop name. Please mention one of: ${Object.keys(CROP_DATA).join(', ')}`
      });
    }

    const result = getPricePrediction(crop, location || 'Chennai');
    if (!result) {
      return res.status(404).json({ success: false, error: `No data for ${crop}` });
    }

    const isHigh = result.predictedPrice > result.currentPrice;
    const status = isHigh ? 'Sell Soon' : result.predictedPrice < result.currentPrice ? 'Hold' : 'Stable';

    res.json({
      success:        true,
      detectedCrop:   result.crop,
      currentPrice:   result.currentPrice,
      predictedPrice: result.predictedPrice,
      market:         `${result.location} Market`,
      unit:           result.unit,
      trendDirection: result.trendDirection,
      trendPercent:   result.trendPercent,
      marketRange:    result.marketRange,
      status,
      aiAdviceEn:     result.recommendation,
      aiAdviceTa:     result.recommendationTa,
      historicalData: result.historicalData,
      timestamp:      new Date().toISOString()
    });

  } catch (err) {
    console.error('AI Price Advisor Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
