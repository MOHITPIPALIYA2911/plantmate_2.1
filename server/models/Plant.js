// server/src/models/Plant.js  (catalog)
const { Schema, model } = require('mongoose');
const plantSchema = new Schema(
  {
    slug: { type: String, unique: true },
    common_name: String,
    scientific_name: String,
    min_sun_hours: Number,
    max_sun_hours: Number,
    indoor_ok: Boolean,
    watering_need: { type: String, enum: ['low', 'med', 'high'] },
    fertilization_freq_days: Number,
    pot_size_min_liters: Number,
    soil_type: String,
    difficulty: { type: String, enum: ['easy', 'med', 'hard'] },
    tags: [String]
  },
  { versionKey: false }
);
module.exports = model('Plant', plantSchema);
