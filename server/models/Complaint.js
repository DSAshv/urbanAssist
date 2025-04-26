import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    default: () => nanoid(10).toUpperCase(),
    required: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['road', 'water', 'electricity', 'garbage', 'streetlight', 'sewage', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  images: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDepartment: {
    type: String,
    enum: ['roads', 'water', 'electricity', 'sanitation', 'public works', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    text: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionDetails: {
    text: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
complaintSchema.index({ location: '2dsphere' });

// Method to get complaint status text
complaintSchema.methods.getStatusText = function() {
  const statuses = {
    'pending': 'Pending Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Rejected'
  };
  return statuses[this.status] || 'Unknown';
};

// Create the model
const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;