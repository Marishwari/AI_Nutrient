// checkModel.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testModel() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 👇 Try generating content with the latest model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const result = await model.generateContent("Say hello! If this works, the model is available.");
    console.log("✅ Response from Gemini:", result.response.text());
  } catch (err) {
    console.error("❌ Model test failed:", err.message);
  }
}

testModel();
