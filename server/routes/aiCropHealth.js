const express = require('express');
const router = express.Router();
const axios = require('axios');
const Diagnosis = require('../models/Diagnosis');
const { getDiseaseInfo, diagnoseFromText } = require('../data/diseaseDatabase');

/**
 * 🩺 AGRI-DOCTOR BACKEND (V6)
 * Primary:  OpenAI GPT-4o-mini (text + vision)
 * Fallback: HuggingFace image classification + Local TNAU Disease Database
 *           (works even with no API quota / no internet)
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HF_TOKEN       = process.env.HF_TOKEN;

const SYSTEM_PROMPT = `You are an expert Agronomist and Plant Pathologist specialized in Tamil Nadu agriculture and TNAU (Tamil Nadu Agricultural University) standards.
Analyze crop health issues from text or images and provide a highly specific agricultural diagnostic report.
STRICT RULE: Focus exclusively on plant pathology, soil health, and pest management.

Return response in STRICT JSON format:
{
  "crop": "Crop Name",
  "diagnosisEn": "Scientific and common name of disease/pest/deficiency",
  "diagnosisTa": "நோய்/பூச்சி பெயர் தமிழில்",
  "treatmentEn": "Specific treatment with dosages (e.g. Carbendazim 50WP @ 1g/litre)",
  "treatmentTa": "சிகிச்சை முறை தமிழில்",
  "preventionEn": "IPM practices, crop rotation, resistant varieties",
  "preventionTa": "தடுப்பு முறைகள் தமிழில்",
  "confidence_score": 0.95,
  "local_remediesEn": "Panchagavya/NSKE/Trichoderma/Jeevamrutam recommendations",
  "local_remediesTa": "இயற்கை/பாரம்பரிய தீர்வுகள் தமிழில்"
}`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai-crop-health/answer
// Body: { queryText, image (base64 or data URI), userId }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/answer', async (req, res) => {
    try {
        const { queryText, image, userId } = req.body;
        if (!queryText && !image) return res.status(400).json({ error: 'Query text or image is required' });

        let responseData = null;

        // ══════════════════════════════════════
        // STAGE 1: Try OpenAI (text or vision)
        // ══════════════════════════════════════
        if (OPENAI_API_KEY) {
            try {
                console.log('🤖 Trying OpenAI...');
                const messages = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: image ? [
                            { type: 'text', text: queryText || 'Identify the crop disease in this image and give detailed treatment.' },
                            { type: 'image_url', image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` } }
                        ] : queryText
                    }
                ];

                const openAiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: 'gpt-4o-mini',
                    messages,
                    response_format: { type: 'json_object' },
                    max_tokens: image ? 1800 : 1000
                }, {
                    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                    timeout: 20000
                });

                const parsed = JSON.parse(openAiRes.data.choices[0].message.content);
                responseData = { success: true, source: 'OpenAI GPT-4o-mini', ...parsed, timestamp: new Date().toISOString() };
                console.log('✅ OpenAI diagnosis complete');
            } catch (openAiErr) {
                const errCode = openAiErr.response?.data?.error?.code;
                console.warn(`⚠️ OpenAI skipped (${errCode || openAiErr.message}). Using fallback...`);
            }
        }

        // ══════════════════════════════════════════════════════════
        // STAGE 2: HuggingFace image classification (image only)
        // ══════════════════════════════════════════════════════════
        if (!responseData && image && HF_TOKEN) {
            try {
                console.log('📡 Trying HuggingFace crop disease model...');
                // Strip data URI prefix and decode to buffer
                const base64Data = image.includes(',') ? image.split(',')[1] : image;
                const imageBuffer = Buffer.from(base64Data, 'base64');

                const hfRes = await axios({
                    method: 'POST',
                    url: 'https://router.huggingface.co/hf-inference/models/trpakov/crop-disease-classification',
                    headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/octet-stream' },
                    data: imageBuffer,
                    timeout: 12000
                });

                if (hfRes.data && Array.isArray(hfRes.data) && hfRes.data.length > 0) {
                    const topLabel = hfRes.data[0].label;
                    const score    = hfRes.data[0].score;
                    console.log(`✅ HF classified: ${topLabel} (${(score * 100).toFixed(1)}%)`);
                    const dbEntry = getDiseaseInfo(topLabel);
                    responseData = {
                        success: true,
                        source: 'HuggingFace + TNAU Disease Database',
                        ...dbEntry,
                        confidence_score: score,
                        timestamp: new Date().toISOString()
                    };
                }
            } catch (hfErr) {
                console.warn('⚠️ HuggingFace skipped:', hfErr.message);
            }
        }

        // ══════════════════════════════════════════════════════════
        // STAGE 3: Local text-based rule matching (offline fallback)
        // ══════════════════════════════════════════════════════════
        if (!responseData && queryText) {
            console.log('🛠️ Using local disease rule engine...');
            const match = diagnoseFromText(queryText);
            if (match) {
                responseData = {
                    success: true,
                    source: 'TNAU Local Disease Database',
                    ...match,
                    timestamp: new Date().toISOString()
                };
            }
        }

        // ══════════════════════════════════════════════════════════
        // STAGE 4: Generic local fallback (last resort for images)
        // ══════════════════════════════════════════════════════════
        if (!responseData && image) {
            console.log('🛠️ Using generic image fallback...');
            const { DISEASE_DB } = require('../data/diseaseDatabase');
            responseData = {
                success: true,
                source: 'TNAU Local Disease Database (Generic)',
                ...DISEASE_DB["Unknown___Disease"],
                timestamp: new Date().toISOString()
            };
        }

        if (!responseData) {
            return res.status(422).json({
                error: 'Could not diagnose the issue.',
                suggestion: 'Please describe the disease symptoms more clearly, e.g. "Tomato leaves with yellow spots"'
            });
        }

        // ══════════════════════════════════════════════════════════
        // PERSIST to MongoDB if userId provided
        // ══════════════════════════════════════════════════════════
        if (userId && userId !== 'guest') {
            try {
                await Diagnosis.create({
                    user:          userId,
                    crop:          responseData.crop,
                    diagnosisEn:   responseData.diagnosisEn,
                    diagnosisTa:   responseData.diagnosisTa,
                    treatmentEn:   responseData.treatmentEn,
                    treatmentTa:   responseData.treatmentTa,
                    preventionEn:  responseData.preventionEn,
                    preventionTa:  responseData.preventionTa,
                    confidence:    responseData.confidence_score,
                    local_remediesEn: responseData.local_remediesEn,
                    local_remediesTa: responseData.local_remediesTa,
                    queryText:     queryText || 'Image Diagnosis',
                    image:         image ? 'IMAGE_ANALYZED' : null
                });
            } catch (dbErr) {
                console.warn('💾 History save error:', dbErr.message);
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('AI Doctor System Failure:', error.message);
        res.status(500).json({ error: 'AI consultation service failure', detail: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai-crop-health/history/:userId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/history/:userId', async (req, res) => {
    try {
        const history = await Diagnosis.find({ user: req.params.userId })
            .sort({ timestamp: -1 })
            .limit(10);
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
