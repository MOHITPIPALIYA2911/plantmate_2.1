// server/services/aiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY missing – AI suggestions will fall back.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

/**
 * Prompt builder – SPACE + PLANTS ko AI ko explain karta hai
 */
function buildPrompt(space, plants) {
    const spaceJson = {
        id: String(space._id),
        name: space.name,
        type: space.type, // balcony / terrace / windowsill / indoor
        sunlight_hours: space.sunlight_hours,
        area_sq_m: space.area_sq_m,
        direction: space.direction,
        notes: space.notes || "",
    };

    const plantJson = plants.map((p) => ({
        plant_slug: p.slug,
        common_name: p.common_name,
        scientific_name: p.scientific_name,
        min_sun_hours: p.min_sun_hours,
        max_sun_hours: p.max_sun_hours,
        indoor_ok: p.indoor_ok,
        watering_need: p.watering_need,
        difficulty: p.difficulty,
        pot_size_min_liters: p.pot_size_min_liters,
        tags: p.tags,
    }));

    return `
You are a gardening expert and recommendation engine.

Given a SPACE and a list of PLANTS, you must:

- Score each plant from 0 to 100 for how suitable it is for that space.
- Give a short rationale for the recommendation.
- Focus on sunlight, space type (balcony/terrace/windowsill/indoor), care difficulty and general suitability.

SPACE:
${JSON.stringify(spaceJson, null, 2)}

PLANTS:
${JSON.stringify(plantJson, null, 2)}

Return JSON ONLY, in this exact shape:

[
  {
    "plant_slug": "basil",
    "score": 85,
    "rationale": "Matches 6h sun, easy care, great for balcony.",
    "tags": ["easy", "herb"]
  }
]

Rules:
- Reply ONLY valid JSON (no backticks, no extra text).
- Include 5–10 best plants sorted by score (highest first).
- score must be between 0 and 100.
`;
}

/**
 * Main function: space + plants -> [{ plant_slug, score, rationale, tags? }]
 */
async function getPlantSuggestions(space, plants) {
    // Safety: agar API key ya model nahi, empty array de do
    if (!model) {
        console.warn("⚠️ Gemini model not initialised – returning empty list.");
        return [];
    }

    const prompt = buildPrompt(space, plants);

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // kabhi-kabhi model ```json ... ``` deta hai, use strip kar dete hain
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (err) {
        console.error("❌ Failed to parse Gemini JSON:", err.message);
        console.error("Raw text:", text);
        return [];
    }

    const recs = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : [];

    if (!recs.length) return [];

    // Normalise: sirf relevant fields rakho
    return recs
        .map((r) => ({
            plant_slug: r.plant_slug || r.slug || r.id,
            score: Number.isFinite(r.score) ? r.score : 50,
            rationale: r.rationale || "Suggested by AI.",
            tags: Array.isArray(r.tags) ? r.tags : [],
        }))
        .filter((r) => r.plant_slug);
}

module.exports = {
    getPlantSuggestions,
};
