const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } = require('../utils/mail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });// Check for duplicate email (findOne)

    const user = await User.create({ name, email, password });
    
    // Generate token and send verification email
    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiration = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${unhashedToken}`;
    
    // Attempt to send email but don't fail registration if SMTP is misconfigured
    try {
      await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(user.name, verificationUrl)
      });
    } catch (mailError) {
      console.warn("Could not send verification email:", mailError.message);
    }

    res.status(201).json({ 
      message: 'User registered. Please check your email to verify your account.', 
      user 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiration: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiration = undefined;
    await user.save({ validateBeforeSave: false });

    // Instantly log them in after verification
    const authToken = signToken(user._id);

    res.status(200).json({ message: "Email verified successfully", token: authToken, user });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body; // takes data from frontend
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiration = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${unhashedToken}`;
    
    let previewUrl = null;
    try {
      const result = await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        mailgenContent: forgotPasswordMailgenContent(user.name, resetUrl)
      });
      previewUrl = result.previewUrl;
    } catch (mailError) {
      console.warn("Could not send reset email:", mailError.message);
    }

    const response = { message: "Password reset mail has been sent." };
    // In development, include the Ethereal preview URL so testers can view the email
    if (process.env.NODE_ENV === 'development' && previewUrl) {
      response.previewUrl = previewUrl;
    }
    res.status(200).json(response);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiration: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Token is invalid or expired" });

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiration = undefined;
    await user.save(); // Don't bypass validation so pre-save hook hashes it!

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me, verifyEmail, forgotPassword, resetPassword };
