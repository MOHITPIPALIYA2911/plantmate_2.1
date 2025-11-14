// server/src/models/CalendarEvent.js
const { Schema, model, Types } = require('mongoose');
const calendarEvent = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: 'User', index: true },
    title: String,
    start: Date,
    end: Date,
    space_name: String,
    note: String
  },
  { timestamps: true, versionKey: false }
);
module.exports = model('CalendarEvent', calendarEvent);
