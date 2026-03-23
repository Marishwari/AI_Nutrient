const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const router = express.Router();
const upload = multer();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ FREE FALLBACK FUNCTION
function fallbackNutrition(description = "") {
  const food = (description || "").toLowerCase();

  if (food.includes("apple")) {
    return { calories: "95 kcal", protein: "0.5 g", fiber: "4 g", fat: "0.3 g" };
  }
  if (food.includes("rice")) {
    return { calories: "200 kcal", protein: "4 g", fiber: "1 g", fat: "0.5 g" };
  }
  if (food.includes("egg")) {
    return { calories: "155 kcal", protein: "13 g", fiber: "0 g", fat: "11 g" };
  }
  if (food.includes("banana")) {
    return { calories: "105 kcal", protein: "1.3 g", fiber: "3 g", fat: "0.4 g" };
  }

  return {
    calories: "150 kcal",
    protein: "5 g",
    fiber: "2 g",
    fat: "3 g",
  };
}

router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    // ✅ SAFE BODY HANDLING
    const description = req.body?.description || "";
    const file = req.file;

    console.log("📦 Parsed Description:", description);
    console.log("🖼️ File received:", !!file);

    if (!description && !file) {
      return res.status(400).json({
        error: "Please provide a food description or upload an image.",
      });
    }

    // ✅ LIMIT INPUT
    if (description.length > 200) {
      return res.json({
        analysis: "⚠️ Please enter shorter description (max 200 characters).",
        source: "validation",
      });
    }

    const contents = [];

    if (description) {
      contents.push({
        role: "user",
        parts: [
          {
            text: `Analyze nutrition for: "${description}". Return JSON with calories, protein, fiber, fat.`,
          },
        ],
      });
    }

    if (file) {
      const base64Image = file.buffer.toString("base64");

      contents.push({
        role: "user",
        parts: [
          { text: "Analyze nutrition from this image. Return JSON only." },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: base64Image,
            },
          },
        ],
      });
    }

    // ✅ TRY GEMINI ONLY IF KEY EXISTS
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const result = await model.generateContent({ contents });
        const text = result?.response?.text()?.trim();

        if (!text) throw new Error("Empty Gemini response");

        let analysis;

        try {
          analysis = JSON.parse(text);
        } catch {
          console.warn("⚠️ Invalid JSON from Gemini, returning raw");
          analysis = text;
        }

        return res.json({
          analysis,
          source: "gemini",
        });
      } catch (err) {
        console.warn("⚠️ Gemini failed:", err.message);
      }
    }

    // ✅ ALWAYS FALLBACK (FREE)
    const fallback = fallbackNutrition(description);

    return res.json({
      analysis: fallback,
      source: "fallback",
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);

    return res.json({
      analysis: fallbackNutrition(req.body?.description),
      source: "fallback",
    });
  }
});

module.exports = router;