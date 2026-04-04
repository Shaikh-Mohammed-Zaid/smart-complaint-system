const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { generateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const sendEmail = require('../utils/sendEmail');

const mapUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    _id: u.id,
    isActive: u.is_active,
    rollNumber: u.roll_number,
    lastLogin: u.last_login,
    createdAt: u.created_at
  };
};

const register = async (req, res) => {
  const { name, email, password, department, rollNumber, phone, role } = req.body;

  // Check if user already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const { data: user, error } = await supabase
    .from('profiles')
    .insert([{
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      department: department || '',
      roll_number: rollNumber || '',
      role: role || 'student'
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  await logActivity(user.id, 'user_registered', 'user', user.id, { role: user.role });

  const token = generateToken(user.id);
  const { password_hash, ...userResponse } = user;
  res.status(201).json({ success: true, token, user: mapUser(userResponse) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  // Update last login
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  await logActivity(user.id, 'user_login', 'user', user.id);

  const token = generateToken(user.id);
  const { password_hash, ...userResponse } = user;
  res.status(200).json({ success: true, token, user: mapUser(userResponse) });
};

const getMe = async (req, res) => {
  const { data: user } = await supabase
    .from('profiles')
    .select('id, name, email, role, department, roll_number, phone, avatar, is_active, last_login, created_at')
    .eq('id', req.user.id)
    .single();

  res.status(200).json({ success: true, user: mapUser(user) });
};

const updateProfile = async (req, res) => {
  const { name, department, rollNumber, phone } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (department !== undefined) updates.department = department;
  if (rollNumber !== undefined) updates.roll_number = rollNumber;
  if (phone !== undefined) updates.phone = phone;
  updates.updated_at = new Date().toISOString();

  const { data: user, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select('id, name, email, role, department, roll_number, phone, avatar, is_active')
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  await logActivity(req.user.id, 'profile_updated', 'user', req.user.id);
  res.status(200).json({ success: true, user: mapUser(user) });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const { data: user } = await supabase
    .from('profiles')
    .select('password_hash')
    .eq('id', req.user.id)
    .single();

  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Incorrect old password' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await supabase.from('profiles').update({ password_hash: passwordHash }).eq('id', req.user.id);
  await logActivity(req.user.id, 'password_changed', 'user', req.user.id);

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const { data: user } = await supabase
    .from('profiles')
    .select('id, email, name')
    .eq('email', email.toLowerCase())
    .single();

  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with that email' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from('profiles').update({
    reset_password_token: hashedToken,
    reset_password_expire: expire
  }).eq('id', user.id);

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
    await supabase.from('profiles').update({
      reset_password_token: null,
      reset_password_expire: null
    }).eq('id', user.id);
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const { data: user } = await supabase
    .from('profiles')
    .select('id, reset_password_expire')
    .eq('reset_password_token', hashedToken)
    .single();

  if (!user || new Date(user.reset_password_expire) < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  const { password, confirmPassword } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await supabase.from('profiles').update({
    password_hash: passwordHash,
    reset_password_token: null,
    reset_password_expire: null
  }).eq('id', user.id);

  await logActivity(user.id, 'password_reset', 'user', user.id);
  res.status(200).json({ success: true, message: 'Password reset successful' });
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
