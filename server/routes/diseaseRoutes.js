const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import the AI service function
const detectPlantDisease = require("../ai/plantDiseaseService");

// ==============================
// MULTER STORAGE CONFIG
// ==============================

const fs = require("fs");
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the current timestamp and original name
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Basic file filter to ensure only images are processed
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// ==============================
// ROUTE : DETECT DISEASE
// ==============================
// POST /api/disease/detect
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    console.log("📥 Request received");

    // 1. Check if image file was uploaded
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    console.log("📂 File received:", req.file.filename);
    console.log("File received:", req.file);

    const imagePath = req.file.path;

    // 2. Call the AI detection service
    const aiResult = await detectPlantDisease(imagePath);

    console.log("🤖 AI raw result:", aiResult);

    // 3. Handle empty or failed AI results
    if (!aiResult || aiResult.length === 0) {
      console.log("⚠️ AI could not detect disease from the provided image");
      return res.status(500).json({
        message: "AI could not detect disease",
      });
    }

    // 4. Return top result along with the full analysis
    const topResult = aiResult[0];

    res.json({
      disease: topResult.label,
      confidence: topResult.score,
      fullResult: aiResult,
    });

  } catch (error) {
    console.error("❌ Detection Error:", error.message);

    res.status(500).json({
      message: "Image analysis failed",
      error: error.message,
    });
  }
});

module.exports = router;