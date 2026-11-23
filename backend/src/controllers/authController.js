const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'recruiter' ? 'recruiter' : 'jobseeker'
    });

    const token = signToken(user._id);

    return res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        targetRole: user.targetRole,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during registration.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.'
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        targetRole: user.targetRole,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login.'
    });
  }
};

exports.getProfile = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: req.user
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { headline, targetRole, skills } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    if (headline !== undefined) user.headline = headline;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (skills !== undefined) user.skills = skills;
    user.profileCompleted = true;

    await user.save();

    return res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        targetRole: user.targetRole,
        skills: user.skills,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
