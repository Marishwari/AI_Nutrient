import React, { useState } from "react";
import axios from "axios";
import {
  FaFire,
  FaDrumstickBite,
  FaLeaf,
  FaTint,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./PostPage.css";

export default function PostPage() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNutrition(null);

    const formData = new FormData();

    if (description.trim()) {
      formData.append("description", description.trim());
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/analyze`,
        formData
      );

      const data = res.data;

      // ✅ HANDLE FALLBACK (MOST IMPORTANT FIX)
      if (data.source === "fallback") {
        console.warn("⚠️ Using fallback data (Gemini quota exceeded)");

        setNutrition({
          ...data.analysis,
          good: "Basic nutritional estimate based on common food values.",
          bad: "AI unavailable currently. These are approximate values.",
        });

        setLoading(false);
        return;
      }

      const analysis = data?.analysis;

      let extracted;

      if (typeof analysis === "object") {
        extracted = analysis;
      } else {
        extracted = extractNutritionData(analysis);
      }

      const summary = extractSummary(analysis || "");

      if (extracted) {
        setNutrition({ ...extracted, ...summary });
        setDescription("");
        setImage(null);
      } else {
        setError("⚠️ Could not extract clear nutrition details. Try again.");
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);

      // ✅ SMART FALLBACK ON ERROR
      setNutrition({
        calories: "150 kcal",
        protein: "5 g",
        fat: "3 g",
        fiber: "2 g",
        good: "Basic estimate due to server/API issue.",
        bad: "Try again later for more accurate AI analysis.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extract nutrition from text
  const extractNutritionData = (text = "") => {
    const calories = text.match(/(\d+\.?\d*)\s*(?:kcal|calories?)/i)?.[1];
    const protein = text.match(/(\d+\.?\d*)\s*(?:g)?\s*protein/i)?.[1];
    const fat = text.match(/(\d+\.?\d*)\s*(?:g)?\s*fat/i)?.[1];
    const fiber = text.match(/(\d+\.?\d*)\s*(?:g)?\s*fiber/i)?.[1];

    if (!calories && !protein && !fat && !fiber) return null;

    return {
      calories: calories ? `${calories} kcal` : "N/A",
      protein: protein ? `${protein} g` : "N/A",
      fat: fat ? `${fat} g` : "N/A",
      fiber: fiber ? `${fiber} g` : "N/A",
    };
  };

  // ✅ Extract summary
  const extractSummary = (text = "") => {
    const goodMatch = text.match(/(?:good|beneficial|rich in|healthy).*?\./i);
    const badMatch = text.match(/(?:avoid|bad|unhealthy|high in|limit).*?\./i);

    return {
      good: goodMatch
        ? goodMatch[0]
        : "This food provides essential nutrients beneficial for health.",
      bad: badMatch
        ? badMatch[0]
        : "Avoid excess consumption for a balanced diet.",
    };
  };

  return (
    <div className="post-page">
      <h2>
        <FaLeaf /> Nutrition Analyzer
      </h2>

      <form onSubmit={handleSubmit} className="post-form">
        <textarea
          placeholder="What did you eat? (e.g., 2 eggs and sambar)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {image && (
          <div className="image-preview">
            <img src={URL.createObjectURL(image)} alt="Selected meal" />
          </div>
        )}

        <button type="submit" disabled={loading || (!description && !image)}>
          {loading ? "Analyzing..." : "Analyze Nutrition"}
        </button>
      </form>

      {loading && <p className="loading">⏳ Analyzing your meal...</p>}

      {nutrition && (
        <div className="result-box">
          <h3>
            <FaLeaf /> Nutrition Breakdown
          </h3>

          <div className="nutrition-summary">
            <p>
              <strong><FaFire /> Calories</strong>
              <span>{nutrition.calories}</span>
            </p>
            <p>
              <strong><FaDrumstickBite /> Protein</strong>
              <span>{nutrition.protein}</span>
            </p>
            <p>
              <strong><FaTint /> Fat</strong>
              <span>{nutrition.fat}</span>
            </p>
            <p>
              <strong><FaLeaf /> Fiber</strong>
              <span>{nutrition.fiber}</span>
            </p>
          </div>

          <div className="nutrition-insights">
            <h4 className="insight-good">
              <FaCheckCircle /> Good Things
            </h4>
            <p>{nutrition.good}</p>

            <h4 className="insight-bad">
              <FaExclamationTriangle /> Things to Watch Out For
            </h4>
            <p>{nutrition.bad}</p>
          </div>
        </div>
      )}
    </div>
  );
}