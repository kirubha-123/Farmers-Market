const express = require('express');
const router = express.Router();
const { getPricePrediction, CROP_DATA } = require('../data/cropPrices');
const { Prediction } = require('../models/AgriModels');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/predictions/predict
// Body: { crop, location }
// Returns: real data-driven price prediction with seasonal trend
// ─────────────────────────────────────────────────────────────────────────────
router.post('/predict', async (req, res) => {
    const { crop, location } = req.body;

    try {
        const result = getPricePrediction(crop, location);

        if (!result) {
            // Crop not found in dataset — return graceful response
            return res.status(404).json({
                message: `No price data found for "${crop}". Available: ${Object.keys(CROP_DATA).join(', ')}`
            });
        }

        // Optionally persist to MongoDB
        try {
            await new Prediction({
                crop:           result.crop,
                location:       result.location,
                currentPrice:   result.currentPrice,
                predictedPrice: result.predictedPrice,
                recommendation: result.recommendation,
                historicalData: result.historicalData.map(h => ({
                    date:  new Date(),
                    price: h.price
                }))
            }).save();
        } catch (dbErr) {
            console.warn('Prediction DB save skipped:', dbErr.message);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Prediction error:', err.message);
        res.status(500).json({ message: 'Prediction failed', error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/predictions/crops  — List all available crops
// ─────────────────────────────────────────────────────────────────────────────
router.get('/crops', (req, res) => {
    const crops = Object.entries(CROP_DATA).map(([name, data]) => ({
        name,
        unit: data.unit,
        trend: data.trend
    }));
    res.json({ crops });
});

module.exports = router;
