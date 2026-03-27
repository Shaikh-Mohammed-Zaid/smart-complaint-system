const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const sendEmail = require('../utils/sendEmail');
const supabase = require('../config/supabase');

const register = async (req, res) => {
  const { name, email, password, department, rollNumber, phone, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    department,
    rollNumber,
    phone,
    role: role || 'student'
  });

  await logActivity(user._id, 'user_registered', 'user', user._id, { role: user.role });

  // Sync to Supabase
  try {
    const { error: sbError } = await supabase.from('profiles').insert([
      {
        id: crypto.randomUUID(), // Mocking UUID for now if not using SB Auth
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        roll_number: user.rollNumber
      }
    ]);
    if (sbError) console.error('Supabase Sync Error:', sbError);
  } catch (err) {
    console.error('Supabase Connection Error:', err);
  }

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await logActivity(user._id, 'user_login', 'user', user._id);

  const token = generateToken(user._id);

  // Exclude password
  const userResponse = user.toJSON();

  res.status(200).json({ success: true, token, user: userResponse });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

const updateProfile = async (req, res) => {
  const { name, department, rollNumber, phone } = req.body;
  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (department !== undefined) user.department = department;
  if (rollNumber !== undefined) user.rollNumber = rollNumber;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  await logActivity(user._id, 'profile_updated', 'user', user._id);

  res.status(200).json({ success: true, user });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(oldPassword))) {
    return res.status(400).json({ success: false, message: 'Incorrect old password' });
  }

  user.password = newPassword;
  await user.save();
  await logActivity(user._id, 'password_changed', 'user', user._id);

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with that email' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">Password Reset Request</h1>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 32px;">You requested a password reset for your SmartFlow account.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 32px;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: 'SmartFlow — Password Reset', html });
    res.status(200).json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  const { password, confirmPassword } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await logActivity(user._id, 'password_reset', 'user', user._id);

  res.status(200).json({ success: true, message: 'Password reset successful' });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
