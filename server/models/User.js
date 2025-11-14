const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  first_Name: { type: String, required: true },
  LastName:   { type: String, required: true },
  emailId:    { type: String, required: true, unique: true, index: true },
  password:   { type: String, required: true },
  role:       { type: String, default: 'user' }
}, { timestamps: true });

module.exports = model('User', userSchema);
