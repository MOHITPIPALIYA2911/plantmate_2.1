// services/aiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Safely parse JSON from Gemini text output
 */
function safeJsonParse(text) {
    try {
        // remove ```json ... ``` wrappers if Gemini adds them
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Gemini JSON parse error:", err);
        return null;
    }
}

/**
 * Get plant recommendations from Gemini
 * @param {Object} space - space document
 * @param {Array} plants - array of plant docs
 * @returns {Promise<Array>} recommendations
 */
async function getPlantSuggestions(space, plants) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const input = {
        space: {
            id: String(space._id || space.id || ""),
            name: space.name,
            type: space.type, // balcony / terrace / windowsill / indoor
            sunlight_hours: space.sunlight_hours,
            direction: space.direction,
            area_sq_m: space.area_sq_m,
            climate_zone: space.climate_zone || "tropical",
        },
        plants: plants.map((p) => ({
            slug: p.slug,
            common_name: p.common_name,
            scientific_name: p.scientific_name,
            min_sun_hours: p.min_sun_hours,
            max_sun_hours: p.max_sun_hours,
            indoor_ok: p.indoor_ok,
            watering_need: p.watering_need,
            difficulty: p.difficulty,
            pot_size_min_liters: p.pot_size_min_liters,
            tags: p.tags,
        })),
    };

    const prompt = `
You are a gardening expert and recommendation engine.

Given a SPACE and a list of PLANTS, you must:
- Score each plant from 0 to 100 for how suitable it is for that space.
- Give a SHORT rationale for the recommendation (1–2 sentences).
- Focus on sunlight, space type (balcony / terrace / windowsill / indoor), care difficulty and general suitability.

RULES:
- Reply ONLY valid JSON.
- Do NOT include any explanation outside JSON.
- JSON shape must be exactly:

{
  "recommendations": [
    {
      "plant_slug": "basil",
      "score": 87,
      "rationale": "Excellent match: 6h sun fits basil, easy-care herb, great for balcony.",
      "tags": ["top-pick", "easy-care", "edible"]
    }
  ]
}

Now use this input and generate recommendations:

${JSON.stringify(input, null, 2)}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = safeJsonParse(text);

    if (!json || !Array.isArray(json.recommendations)) {
        throw new Error("Invalid AI response format");
    }

    return json.recommendations;
}

module.exports = {
    getPlantSuggestions,
};
