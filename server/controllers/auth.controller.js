const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
