import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendMail } from '../utils/email.js';

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;
    
    // Validate request
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Create new complaint
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(location.longitude) || 0,
          parseFloat(location.latitude) || 0
        ],
        address: location.address
      },
      images,
      user: req.user._id
    });

    // Send confirmation email
    sendMail({
      to: req.user.email,
      subject: 'Complaint Submitted Successfully',
      html: `
        <h1>Complaint Submitted</h1>
        <p>Dear ${req.user.firstName},</p>
        <p>Your complaint has been submitted successfully with the following details:</p>
        <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
        <p><strong>Title:</strong> ${complaint.title}</p>
        <p><strong>Category:</strong> ${complaint.category}</p>
        <p><strong>Status:</strong> ${complaint.getStatusText()}</p>
        <p>You can track the status of your complaint through your account dashboard.</p>
        <p>Thank you for helping improve our community.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      `
    }).catch(err => console.error('Complaint confirmation email error:', err));

    // Response
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
};

// Get all complaints (with filtering, sorting, and pagination)
export const getComplaints = async (req, res) => {
  try {
    let query = {};
    
    // Filtering
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // For regular users, only show their own complaints
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;
    
    // Execute query with pagination and sorting
    const complaints = await Complaint.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    // Get total count for pagination
    const total = await Complaint.countDocuments(query);
    
    // Response
    res.status(200).json({
      success: true,
      count: complaints.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        complaints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get complaints',
      error: error.message
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('comments.createdBy', 'firstName lastName role');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check if user is authorized to view this complaint
    if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get complaint',
      error: error.message
    });
  }
};

// Update complaint status (admin only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    // Find complaint
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Update status
    complaint.status = status;
    
    // Add comment if provided
    if (comment) {
      complaint.comments.push({
        text: comment,
        createdBy: req.user._id
      });
    }
    
    // If status is resolved, add resolution details
    if (status === 'resolved') {
      complaint.resolutionDetails = {
        text: comment || 'Issue resolved',
        resolvedBy: req.user._id,
        resolvedAt: Date.now()
      };
    }
    
    await complaint.save();
    
    // Send email notification to the user
    sendMail({
      to: complaint.user.email,
      subject: `Complaint Status Updated: ${complaint.complaintId}`,
      html: `
        <h1>Complaint Status Updated</h1>
        <p>Dear ${complaint.user.firstName},</p>
        <p>The status of your complaint has been updated:</p>
        <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
        <p><strong>Title:</strong> ${complaint.title}</p>
        <p><strong>New Status:</strong> ${complaint.getStatusText()}</p>
        ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        <p>You can view more details by logging into your account dashboard.</p>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      `
    }).catch(err => console.error('Status update email error:', err));
    
    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};

// Assign complaint to department (admin only)
export const assignComplaint = async (req, res) => {
  try {
    const { department, assignedTo, note } = req.body;
    
    // Find complaint
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Update assigned department
    complaint.assignedDepartment = department;
    
    // If assignedTo is provided, assign to user
    if (assignedTo) {
      // Verify user exists and is admin
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
      
      complaint.assignedTo = assignedTo;
    }
    
    // Add assignment note as comment
    if (note) {
      complaint.comments.push({
        text: `Assigned to ${department} department. ${note}`,
        createdBy: req.user._id
      });
    }
    
    // If status is pending, update to in-progress
    if (complaint.status === 'pending') {
      complaint.status = 'in-progress';
    }
    
    await complaint.save();
    
    // Send email notification to the user
    sendMail({
      to: complaint.user.email,
      subject: `Complaint Assigned: ${complaint.complaintId}`,
      html: `
        <h1>Complaint Assigned</h1>
        <p>Dear ${complaint.user.firstName},</p>
        <p>Your complaint has been assigned to the ${department} department:</p>
        <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
        <p><strong>Title:</strong> ${complaint.title}</p>
        <p><strong>Status:</strong> ${complaint.getStatusText()}</p>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
        <p>You can track the progress through your account dashboard.</p>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      `
    }).catch(err => console.error('Assignment email error:', err));
    
    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: {
        complaint
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
      error: error.message
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    // Find complaint and populate necessary fields
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('comments.createdBy', 'firstName lastName role');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this complaint'
      });
    }
    
    // Create new comment
    const newComment = {
      text: comment,
      createdBy: req.user._id
    };
    
    // Add comment and save
    complaint.comments.push(newComment);
    await complaint.save();
    
    // Get the newly added comment with populated createdBy
    const savedComment = await Complaint.findOne(
      { _id: complaint._id, 'comments._id': complaint.comments[complaint.comments.length - 1]._id },
      { 'comments.$': 1 }
    )
    .populate('comments.createdBy', 'firstName lastName role');
    
    if (!savedComment) {
      throw new Error('Failed to retrieve saved comment');
    }
    
    const populatedComment = savedComment.comments[0];
    
    // Send notification email if needed
    if (req.user.role === 'admin' && req.user._id.toString() !== complaint.user._id.toString()) {
      sendMail({
        to: complaint.user.email,
        subject: `New Comment on Your Complaint: ${complaint.complaintId}`,
        html: `
          <h1>New Comment on Your Complaint</h1>
          <p>Dear ${complaint.user.firstName},</p>
          <p>A new comment has been added to your complaint:</p>
          <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>Comment:</strong> ${comment}</p>
          <p>You can log in to your account dashboard to respond or check for updates.</p>
          <p>Best regards,<br>The UrbanAssist Team</p>
        `
      }).catch(err => console.error('Comment notification email error:', err));
    }
    
    // Return success response with the full comment data
    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          _id: populatedComment._id,
          text: populatedComment.text,
          createdAt: populatedComment.createdAt,
          createdBy: {
            _id: populatedComment.createdBy._id,
            firstName: populatedComment.createdBy.firstName,
            lastName: populatedComment.createdBy.lastName,
            role: populatedComment.createdBy.role
          }
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get nearby complaints (within radius)
export const getNearbyComplaints = async (req, res) => {
  try {
    const { longitude, latitude, radius = 5 } = req.query; // radius in kilometers
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Convert radius from kilometers to meters
    const radiusInMeters = parseFloat(radius) * 1000;
    
    // Find complaints within radius
    const complaints = await Complaint.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .limit(50)
    .populate('user', 'firstName lastName')
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: {
        complaints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby complaints',
      error: error.message
    });
  }
};

// Get complaints statistics (admin only)
export const getComplaintStats = async (req, res) => {
  try {
    // Get counts by status
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by department
    const departmentStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$assignedDepartment',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get resolution time stats
    const resolutionTimeStats = await Complaint.aggregate([
      {
        $match: {
          status: 'resolved',
          'resolutionDetails.resolvedAt': { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolutionDetails.resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statusStats,
        categoryStats,
        priorityStats,
        departmentStats,
        resolutionTimeStats: resolutionTimeStats[0] || {
          avgResolutionTime: 0,
          minResolutionTime: 0,
          maxResolutionTime: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get complaint statistics',
      error: error.message
    });
  }
};