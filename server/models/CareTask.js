// server/src/models/CareTask.js
const { Schema, model, Types } = require('mongoose');
const careTaskSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User', index: true },
    user_plant_id: { type: Types.ObjectId, ref: 'UserPlant' },
    type: { type: String, enum: ['water', 'fertilize'], required: true },
    due_at: { type: Date, index: true },
    status: { type: String, enum: ['pending', 'done', 'skipped', 'snoozed'], default: 'pending' },
    completed_at: Date,
    recurrence_days: { type: Number, default: 0 },
    note: String
  },
  { timestamps: true, versionKey: false }
);
module.exports = model('CareTask', careTaskSchema);
