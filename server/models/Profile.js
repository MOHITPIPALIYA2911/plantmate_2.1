// server/src/models/Profile.js
const { Schema, model, Types } = require('mongoose');

const profileSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User', index: true, unique: true },
    name: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    city: String,
    lat: Number,
    lon: Number,
    preferred_units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    settings: {
      theme: { mode: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' } },
      notif: {
        in_app: { type: Boolean, default: true },
        default_snooze_min: { type: Number, default: 120 }
      },
      first_day_of_week: { type: String, enum: ['sun', 'mon'], default: 'mon' },
      care_defaults: {
        overdue_snooze_policy: { type: String, enum: ['from_now', 'keep_today'], default: 'from_now' }
      }
    }
  },
  { versionKey: false }
);
module.exports = model('Profile', profileSchema);
