// server/src/models/Space.js
const { Schema, model, Types } = require('mongoose');
const spaceSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User', index: true },
    name: String,
    type: { type: String, enum: ['balcony', 'windowsill', 'terrace'] },
    direction: { type: String, enum: ['N','NE','E','SE','S','SW','W','NW'] },
    sunlight_hours: { type: Number, min: 0, max: 12 },
    area_sq_m: Number,
    notes: String
  },
  { timestamps: true, versionKey: false }
);
module.exports = model('Space', spaceSchema);
