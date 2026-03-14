const express = require('express');
const router = express.Router();
const axios = require('axios');
const Diagnosis = require('../models/Diagnosis');

/**
 * 🩺 ADVANCED AGRI-DOCTOR BACKEND (V5) - OPENAI GPT-4o-mini INTEGRATION
 * Features: OpenAI Chat Completions, Real-time Medical Diagnosis, History Tracking
 */

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * POST /api/ai-crop-health/answer
 * Body: { queryText, image, userId }
 */
router.post('/answer', async (req, res) => {
    try {
        const { queryText, image, userId } = req.body;
        if (!queryText && !image) return res.status(400).json({ error: "Query text or image is required" });

        console.log(`🤖 Consulting OpenAI for: ${queryText || "Image Analysis"}`);

        // 1. CONSTRUCT SYSTEM PROMPT (STRICTLY AGRICULTURAL)
        const systemPrompt = `You are an expert Agronomist and Plant Pathologist specialized in Tamil Nadu agriculture and TNAU (Tamil Nadu Agricultural University) standards. 
Your task is to analyze crop health issues from text or images and provide a highly specific agricultural diagnostic report. 
STRICT RULE: DO NOT provide human medical advice. Focus exclusively on plant pathology, soil health, and pest management.

Return the response in STRICT JSON format with the following structure:
{
  "crop": "Crop Name (e.g. Paddy, Tomato, Turmeric, Sugarcane)",
  "diagnosisEn": "Scientific name and common name of the pest, disease, or nutrient deficiency",
  "diagnosisTa": "நோய், பூச்சி அல்லது ஊட்டச்சத்து குறைபாட்டின் பெயர்",
  "treatmentEn": "Specific agricultural treatment. Include dosages (e.g., ml/litre), biopesticides (e.g., Pseudomonas, Trichoderma), and chemical controls (e.g., Carbendazim, Mancozeb) if necessary.",
  "treatmentTa": "தமிழ் மொழியில் சிகிச்சை முறைகள் (மருந்தின் அளவு மற்றும் தெளிக்கும் முறை)",
  "preventionEn": "Integrated Pest Management (IPM) practices, crop rotation, and soil solarization advice.",
  "preventionTa": "பயிர் மேலாண்மை மற்றும் தடுப்பு முறைகள்",
  "confidence_score": 0.98,
  "local_remediesEn": "Traditional Tamil Nadu organic remedies like Panchagavya, NSKE (Neem Seed Kernel Extract), or Jeevamrutam.",
  "local_remediesTa": "பாரம்பரிய இயற்கை விவசாய முறைகள் (பஞ்சகவ்யா, வேப்பங்கொட்டை கரைசல், ஜீவாமிர்தம் போன்றவை)"
}`;

        // 2. CALL OPENAI API
        let openAiResponse;
        if (OPENAI_API_KEY) {
            try {
                // If it's an image, we use the vision capabilities (gpt-4o-mini supports vision)
                const messages = [
                    { role: "system", content: systemPrompt },
                    { 
                        role: "user", 
                        content: image ? [
                            { type: "text", text: queryText || "Identify the disease and provide treatment for this plant." },
                            { type: "image_url", image_url: { url: image.startsWith('data') ? image : `data:image/jpeg;base64,${image}` } }
                        ] : queryText 
                    }
                ];

                const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: "gpt-4o-mini",
                    messages: messages,
                    response_format: { type: "json_object" },
                    max_tokens: 1000
                }, {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                openAiResponse = JSON.parse(response.data.choices[0].message.content);
            } catch (err) {
                console.error("OpenAI API Error:", err.response?.data || err.message);
                throw new Error("AI consultation failed");
            }
        } else {
            return res.status(500).json({ error: "OpenAI API Key missing" });
        }

        const responseData = {
            success: true,
            source: "OpenAI GPT-4o-mini (Clinical AI)",
            ...openAiResponse,
            timestamp: new Date().toISOString()
        };

        // 3. PERSISTENCE (Save to MongoDB History)
        if (userId && userId !== 'guest') {
            try {
                await Diagnosis.create({
                    user: userId,
                    crop: responseData.crop,
                    diagnosisEn: responseData.diagnosisEn,
                    diagnosisTa: responseData.diagnosisTa,
                    treatmentEn: responseData.treatmentEn,
                    treatmentTa: responseData.treatmentTa,
                    preventionEn: responseData.preventionEn,
                    preventionTa: responseData.preventionTa,
                    confidence: responseData.confidence_score,
                    local_remediesEn: responseData.local_remediesEn,
                    local_remediesTa: responseData.local_remediesTa,
                    queryText: queryText || "Image Diagnosis",
                    image: image ? "IMAGE_ANALYZED" : null
                });
            } catch (err) {
                console.error("💾 History save error:", err);
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error("AI Doctor System Failure:", error);
        res.status(500).json({ error: "AI consultation service failure" });
    }
});

/**
 * GET /api/ai-crop-health/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const history = await Diagnosis.find({ user: req.params.userId })
            .sort({ timestamp: -1 })
            .limit(10);
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch medical history" });
    }
});

module.exports = router;
