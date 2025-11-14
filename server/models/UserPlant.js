// server/src/models/UserPlant.js
const { Schema, model, Types } = require('mongoose');
const userPlantSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User', index: true },
    space_id: { type: Types.ObjectId, ref: 'Space' },
    plant_slug: { type: String, ref: 'Plant' },
    nickname: String,
    acquired_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'done', 'failed'], default: 'active' },
    custom_prefs: {
      watering_adj_pct: Number,
      fertilization_adj_pct: Number
    }
  },
  { timestamps: true, versionKey: false }
);
module.exports = model('UserPlant', userPlantSchema);
