import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken -mfaSecret');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};
