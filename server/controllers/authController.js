import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { sendMail } from '../utils/email.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d'
  });
};

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// Register a new user
export const register = async (req, res, doNotSetCookie) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    if (!doNotSetCookie) {
      // Set cookies
      res.cookie('token', token, cookieOptions);
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }


    // Welcome email
    sendMail({
      to: user.email,
      subject: 'Welcome to Community Problem Reporting System',
      html: `
        <h1>Welcome to Community Problem Reporting System!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering with our community problem reporting system. You can now report problems in your community.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      `
    }).catch(err => console.error('Welcome email error:', err));

    // Response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password +mfaSecret');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has MFA enabled
    if (user.mfaEnabled) {
      // If MFA token is not provided, return that MFA is required
      if (!mfaToken) {
        return res.status(200).json({
          success: true,
          mfaRequired: true,
          message: 'MFA verification required',
          data: {
            userId: user._id
          }
        });
      }

      // Verify MFA token
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid MFA token'
        });
      }
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfaEnabled
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    // If user is authenticated, remove refresh token
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Setup MFA
export const setupMFA = async (req, res) => {
  try {
    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `CPRS:${req.user.email}`
    });

    // Save secret to user
    req.user.mfaSecret = secret.base32;
    await req.user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'MFA setup initialized',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MFA setup failed',
      error: error.message
    });
  }
};

// Verify and enable MFA
export const verifyAndEnableMFA = async (req, res) => {
  try {
    const { token } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide MFA token'
      });
    }

    // Get user with MFA secret
    const user = await User.findById(req.user._id).select('+mfaSecret');

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    // Enable MFA
    user.mfaEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MFA verification failed',
      error: error.message
    });
  }
};

// Disable MFA
export const disableMFA = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Check if token and password are provided
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide MFA token and password'
      });
    }

    // Get user with password and MFA secret
    const user = await User.findById(req.user._id).select('+password +mfaSecret');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA',
      error: error.message
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    // Generate new tokens
    const token = generateToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    // Update refresh token in database
    req.user.refreshToken = refreshToken;
    await req.user.save();

    // Set cookies
    res.cookie('token', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture,
          mfaEnabled: user.mfaEnabled
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};