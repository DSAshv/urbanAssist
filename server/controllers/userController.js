import { useReducedMotion } from 'framer-motion';
import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, department, status, search } = req.query;

        const query = {};

        if (role) query.role = role;
        if (department) query.department = department;
        if (status) {
            if (status === "active") query.active = true;
            else if (status === "suspended") query.active = false;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -refreshToken -mfaSecret')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message,
        });
    }
};

// controllers/userController.js
import { register } from "./authController.js"

export const createUser = async (req, res) => {
  try {
    // Create mock response object
    const mockRes = {
      statusCode: 200,
      body: {},
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; }
    };

    // Call register controller
    await register({ body: req.body }, mockRes, true);
    
    if (mockRes.statusCode !== 201) {
      throw new Error(mockRes.body.message || 'Registration failed');
    }

    // Return without auth tokens
    res.status(201).json({
      success: true,
      data: {
        user: mockRes.body.data.user
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Edit an existing user (admin only)
export const editUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from request parameters
        const { name, email, role, department, active } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update user fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.department = department || user.department;
        user.active = active !== undefined ? active : user.active;

        // Save updated user
        await user.save();

        res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
};

export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from request parameters
        const { reason } = req.body; // Get reason for suspension

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Suspend the user and store the reason
        user.suspended = true;
        user.active = false;
        user.suspensionReason = reason;

        // Save the updated user
        await user.save();

        res.status(200).json({ success: true, message: 'User suspended successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to suspend user', error: error.message });
    }
};

export const unsuspendUser = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from request parameters

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Unsuspend the user
        user.suspended = false;
        user.active = true;
        user.suspensionReason = null; // Clear suspension reason

        // Save the updated user
        await user.save();

        res.status(200).json({ success: true, message: 'User unsuspended successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to unsuspend user', error: error.message });
    }
};