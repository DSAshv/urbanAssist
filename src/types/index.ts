// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
  profilePicture?: string;
  mfaEnabled: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  mfaRequired?: boolean;
}

// Complaint types
export interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location: Location;
  images: string[];
  user: User | string;
  assignedDepartment?: string;
  assignedTo?: User | string;
  comments: Comment[];
  resolutionDetails?: ResolutionDetails;
  createdAt: string;
  updatedAt: string;
}

export type ComplaintCategory = 'road' | 'water' | 'electricity' | 'garbage' | 'streetlight' | 'sewage' | 'other';

export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface Comment {
  _id: string;
  text: string;
  createdBy: User | string;
  createdAt: string;
}

export interface ResolutionDetails {
  text?: string;
  resolvedBy?: User | string;
  resolvedAt?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  data: T;
}

// Stats types
export interface ComplaintStats {
  statusStats: { _id: ComplaintStatus; count: number }[];
  categoryStats: { _id: ComplaintCategory; count: number }[];
  priorityStats: { _id: ComplaintPriority; count: number }[];
  departmentStats: { _id: string; count: number }[];
  resolutionTimeStats: {
    avgResolutionTime: number;
    minResolutionTime: number;
    maxResolutionTime: number;
  };
}