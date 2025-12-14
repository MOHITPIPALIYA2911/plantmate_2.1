// server/services/aiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("🔥 AI CLIENT INIT STARTED");

// 1. Check API key
const apiKey = process.env.GEMINI_API_KEY;
console.log("🔍 GEMINI_API_KEY exists? =", !!apiKey);

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY missing – AI suggestions will fallback.");
}

let model = null;
if (apiKey) {
    try {
        console.log("🚀 Initializing GoogleGenerativeAI...");
        const genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ Gemini model initialised successfully!");
    } catch (err) {
        console.error("❌ ERROR initializing Gemini model:", err);
    }
} else {
    console.warn("⚠️ No API Key — model = null");
}

/**
 * Clean ```json fences
 */
function cleanAIText(text) {
    return text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
}

/**
 * Build Prompt
 */
function buildPrompt(space, plants) {
    console.log("🧩 Building Gemini prompt...");

    return `
You are a gardening expert and recommendation engine.

Given a SPACE and a list of PLANTS, you must:

- Score each plant from 0 to 100
- Provide a short rationale
- Focus on sunlight, care difficulty, space type

SPACE:
${JSON.stringify(space, null, 2)}

PLANTS:
${JSON.stringify(plants, null, 2)}

Return ONLY valid JSON array:
[
  {
    "plant_slug": "basil",
    "score": 85,
    "rationale": "Matches 6h sun...",
    "tags": ["easy"]
  }
]
`.trim();
}

/**
 * Main AI suggestion function
 */
async function getPlantSuggestions(space, plants) {
    console.log("\n===============================");
    console.log("🌱 getPlantSuggestions() CALLED");
    console.log("===============================");
    console.log("🔹 SPACE:", space);
    console.log("🔹 PLANTS COUNT:", plants?.length);

    if (!model) {
        console.log("❌ Gemini model is NULL → returning empty []");
        return [];
    }

    const prompt = buildPrompt(space, plants);

    console.log("📤 Sending prompt to Gemini...");
    console.log("📝 Prompt Preview (first 500 chars):");
    console.log(prompt.substring(0, 500));

    let aiResponse;
    try {
        const result = await model.generateContent(prompt);
        aiResponse = result.response.text();
        console.log("📥 RAW Gemini Response:");
        console.log(aiResponse);
    } catch (err) {
        console.error("❌ ERROR from Gemini API:", err.message);
        return [];
    }

    let text = cleanAIText(aiResponse);
    console.log("🧹 Cleaned Gemini Response:");
    console.log(text);

    let parsed;
    try {
        parsed = JSON.parse(text);
        console.log("✅ JSON Parsed Successfully!");
    } catch (err) {
        console.error("❌ JSON PARSE FAILED:", err);
        console.log("🔥 RAW TEXT THAT FAILED PARSING:");
        console.log(text);
        return [];
    }

    const list = Array.isArray(parsed)
        ? parsed
        : parsed.recommendations || [];

    console.log("📊 Number of items Gemini returned:", list.length);

    // Normalize
    const normalized = list
        .map((r) => ({
            plant_slug: r.plant_slug || r.slug || r.id,
            score: Number(r.score) || 50,
            rationale: r.rationale || "Suggested by AI.",
            tags: r.tags || [],
        }))
        .filter((r) => r.plant_slug);

    console.log("✨ Final Normalized AI Suggestions:", normalized);

    return normalized;
}

module.exports = {
    getPlantSuggestions,
};
