// server/src/models/Space.js
const { Schema, model, Types } = require('mongoose');
const SpaceSchema = new Schema(
  {
    name: String,
    type: String,
    direction: String,
    sunlight_hours: Number,
    area_sq_m: Number,
    notes: String,

    // 🔹 NEW: geo location
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = model('Space', SpaceSchema);
