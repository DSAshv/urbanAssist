import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import Loading from '../components/ui/Loading';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaExclamationCircle,
  FaImage,
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaTimesCircle,
  FaArrowAltCircleUp,
  FaArrowAltCircleDown,
  FaInfoCircle
} from 'react-icons/fa';
import { MdCategory, MdAssignment } from 'react-icons/md';
import { RiMapPinTimeFill } from 'react-icons/ri';
import { ImageViewer } from '../components/ui/ImageViewer';
import { useAuth } from '../context/AuthContext';

// Import images directly
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
interface Comment {
  _id: string;
  text: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  location: {
    coordinates: [number, number];
    address: string;
  };
  images: string[];
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedDepartment?: string;
  createdAt: string;
  comments: Comment[];
  resolutionDetails?: {
    text: string;
    resolvedBy: string;
    resolvedAt: string;
  };
}

const statusIcons = {
  pending: <FaClock className="text-yellow-500" />,
  'in-progress': <FaSpinner className="text-blue-500 animate-spin" />,
  resolved: <FaCheckCircle className="text-green-500" />,
  rejected: <FaTimesCircle className="text-red-500" />,
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/complaints/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setComplaint(response.data.data.complaint);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch complaint details');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      setSubmittingComment(true);
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: {
          comment: {
            _id: string;
            text: string;
            createdAt: string;
            createdBy: {
              _id: string;
              firstName: string;
              lastName: string;
              role: string;
            };
          };
        };
      }>(
        `/api/complaints/${id}/comments`,
        { comment: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // Update state with the new comment
      setComplaint(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, response.data.data.comment]
        };
      });
  
      setNewComment('');
      toast.success(response.data.message || 'Comment added successfully!');
  
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(
        err.response?.data?.message || 
        err.message || 
        'Failed to add comment'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <Loading message="Loading complaint details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">
            <FaTimesCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Complaint</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <FaExclamationCircle className="mr-2" />
            {complaint.title}
          </h1>
          <div className="flex items-center mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-3">
              {statusIcons[complaint.status]}
              <span className="ml-1 capitalize">{complaint.status.replace('-', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[complaint.priority]}`}>
              {complaint.priority === 'high' ? (
                <FaArrowAltCircleUp className="mr-1" />
              ) : complaint.priority === 'low' ? (
                <FaArrowAltCircleDown className="mr-1" />
              ) : (
                <FaInfoCircle className="mr-1" />
              )}
              <span className="capitalize">{complaint.priority}</span>
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Complaint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MdCategory className="mr-2 text-blue-500" />
                  Details
                </h2>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-gray-600 font-medium w-32 flex-shrink-0">Description:</span>
                    <span className="text-gray-900">{complaint.description}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 font-medium w-32 flex-shrink-0">Category:</span>
                    <span className="text-gray-900 capitalize">{complaint.category}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 font-medium w-32 flex-shrink-0">Submitted By:</span>
                    <span className="text-gray-900">
                      {complaint.user.firstName} {complaint.user.lastName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 font-medium w-32 flex-shrink-0">Submitted On:</span>
                    <span className="text-gray-900 flex items-center">
                      <FaCalendarAlt className="mr-1 text-gray-500" />
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  {complaint.assignedDepartment && (
                    <div className="flex">
                      <span className="text-gray-600 font-medium w-32 flex-shrink-0">Assigned Department:</span>
                      <span className="text-gray-900 flex items-center">
                        <MdAssignment className="mr-1 text-blue-500" />
                        {complaint.assignedDepartment}
                      </span>
                    </div>
                  )}
                  {complaint.assignedTo && (
                    <div className="flex">
                      <span className="text-gray-600 font-medium w-32 flex-shrink-0">Assigned To:</span>
                      <span className="text-gray-900 flex items-center">
                        <FaUser className="mr-1 text-blue-500" />
                        {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                      </span>
                    </div>
                  )}
                  {complaint.resolutionDetails && (
                    <div className="flex">
                      <span className="text-gray-600 font-medium w-32 flex-shrink-0">Resolved On:</span>
                      <span className="text-gray-900 flex items-center">
                        <RiMapPinTimeFill className="mr-1 text-green-500" />
                        {formatDate(complaint.resolutionDetails.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {complaint.images.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaImage className="mr-2 text-blue-500" />
                    Attached Images ({complaint.images.length})
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {complaint.images.map((image, index) => (
                      <div
                        key={index}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`Complaint ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Map */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                Location
              </h2>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200 z-0">
                {complaint.location.coordinates && (
                  <MapContainer
                    center={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}
                    zoom={15}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}
                    >
                      <Popup>{complaint.location.address || 'Complaint location'}</Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
              <p className="mt-2 text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-1" />
                {complaint.location.address || 'No address provided'}
              </p>
            </div>
          </div>
          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaComment className="mr-2 text-blue-500" />
              Comments ({complaint.comments.length})
            </h2>

            <div className="space-y-4 mb-6">
              {complaint.comments.length > 0 ? (
                complaint.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`p-4 rounded-lg ${comment.createdBy.role === 'admin'
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-gray-50 border-l-4 border-gray-300'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">
                        {comment.createdBy.firstName} {comment.createdBy.lastName}{' '}
                        {comment.createdBy.role === 'admin' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-1">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="mt-4">
              <div className="flex items-start space-x-2">
                <div className="flex-grow">
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingComment}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submittingComment ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send
                      <FaPaperPlane className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default ComplaintDetails;