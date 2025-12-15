const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res, next) => {
  try {
    const { first_Name, LastName, emailId, password } = req.body;
    if (!first_Name || !LastName || !emailId || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ emailId: emailId.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_Name, LastName,
      emailId: emailId.toLowerCase(),
      password: hash
    });

    res.status(201).json({ id: user._id });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    
    // Send welcome email (non-blocking)
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
      sendEmail(
        user.emailId,
        '🌱 Welcome to PlantMate!',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Welcome to PlantMate, ${user.first_Name}!</h2>
            <p>Thank you for logging in. We're excited to help you take care of your plants.</p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This email confirms that your email service is working correctly. You'll receive notifications for care tasks and reminders.
            </p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Happy planting! 🌿
            </p>
          </div>
        `
      ).catch(err => {
        console.error(`Failed to send welcome email to ${user.emailId}:`, err.message);
      });
    }

    res.json({
      token,
      user: {
        _id: user._id,
        first_Name: user.first_Name,
        LastName: user.LastName,
        emailId: user.emailId,
        role: user.role || 'user'
      }
    });
  } catch (e) { next(e); }
};
