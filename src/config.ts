export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Map config
export const DEFAULT_MAP_CENTER = [40.7128, -74.0060]; // NYC coordinates
export const DEFAULT_MAP_ZOOM = 13;

// Complaint categories with icons
export const COMPLAINT_CATEGORIES = [
  { value: 'road', label: 'Road', icon: 'road' },
  { value: 'water', label: 'Water', icon: 'droplet' },
  { value: 'electricity', label: 'Electricity', icon: 'zap' },
  { value: 'garbage', label: 'Garbage', icon: 'trash' },
  { value: 'streetlight', label: 'Streetlight', icon: 'lamp' },
  { value: 'sewage', label: 'Sewage', icon: 'pipe' },
  { value: 'other', label: 'Other', icon: 'alert-circle' }
];

// Complaint statuses with colors
export const COMPLAINT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' }
];

// Complaint priorities with colors
export const COMPLAINT_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
];

// Departments
export const DEPARTMENTS = [
  { value: 'roads', label: 'Roads Department' },
  { value: 'water', label: 'Water Department' },
  { value: 'electricity', label: 'Electricity Department' },
  { value: 'sanitation', label: 'Sanitation Department' },
  { value: 'public works', label: 'Public Works' },
  { value: 'other', label: 'Other' }
];

// Page size options for tables
export const PAGE_SIZES = [10, 25, 50, 100];