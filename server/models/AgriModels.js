const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    crop: { type: String, required: true },
    location: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    predictedPrice: { type: Number, required: true },
    confidence: { type: Number, default: 0.85 },
    recommendation: { type: String },
    historicalData: [{
        date: { type: Date },
        price: { type: Number }
    }],
    timestamp: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('Prediction', predictionSchema);

const logisticsTripSchema = new mongoose.Schema({
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    vehicleType: { type: String, required: true }, // e.g., 'Tata Ace', 'Mahindra Bolero', 'Tractor'
    vehicleNumber: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    capacity: { type: Number, required: true }, // in tons
    currentLoad: { type: Number, default: 0 },
    departureTime: { type: Date, required: true },
    pricePerKg: { type: Number, required: true },
    status: { type: String, enum: ['available', 'full', 'completed'], default: 'available' },
    timestamp: { type: Date, default: Date.now }
});

const LogisticsTrip = mongoose.model('LogisticsTrip', logisticsTripSchema);

module.exports = { Prediction, LogisticsTrip };
