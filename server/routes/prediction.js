const express = require('express');
const router = express.Router();
const { Prediction } = require('../models/AgriModels');

// AI Price Prediction Oracle
router.post('/predict', async (req, res) => {
    const { crop, location } = req.body;

    try {
        // Mocking ML logic: In a real scenario, this would call TensorFlow.js or a Python microservice
        // Logic: 2025-2026 data trends (Rising due to festivals/weather)
        const currentPrice = 45 + Math.random() * 10;
        const trend = 1.15; // 15% increase predicted
        const predictedPrice = currentPrice * trend;

        const prediction = new Prediction({
            crop,
            location,
            currentPrice: currentPrice.toFixed(2),
            predictedPrice: predictedPrice.toFixed(2),
            recommendation: trend > 1.05 ? "Hold! Prices are expected to rise by 15% next Tuesday." : "Sell now, market is stable.",
            historicalData: [
                { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), price: currentPrice - 5 },
                { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), price: currentPrice - 2 },
                { date: new Date(), price: currentPrice }
            ]
        });

        await prediction.save();
        res.status(200).json(prediction);
    } catch (err) {
        res.status(500).json({ message: "Prediction failed", error: err.message });
    }
});

module.exports = router;
