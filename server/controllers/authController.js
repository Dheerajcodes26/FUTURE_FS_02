import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '7d'
  });
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (admin && (await admin.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        data: {
          _id: admin._id,
          email: admin.email,
          token: generateToken(admin._id)
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-passwordHash');
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Register a new admin account
// @route   POST /api/auth/register
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check for existing admin with same email
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await Admin.hashPassword(password);

    const admin = await Admin.create({
      name: name ? name.trim() : '',
      email: email.toLowerCase().trim(),
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Helper: Seed default admin on server startup if no admin exists
export const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (adminEmail && adminPassword) {
        const passwordHash = await Admin.hashPassword(adminPassword);

        await Admin.create({
          email: adminEmail.toLowerCase(),
          passwordHash
        });
        console.log(`Default Admin created: ${adminEmail}`);
      } else {
        console.warn('No ADMIN_EMAIL/ADMIN_PASSWORD provided — skipping default admin seed. Create an admin manually.');
      }
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};
