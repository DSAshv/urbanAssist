import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, AlertCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import { Complaint } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import CategoryIcon from './CategoryIcon';

interface ComplaintCardProps {
  complaint: Complaint;
  isCompact?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, isCompact = false }) => {
  // Determine if the user viewing the card is an admin to adjust the link path
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
  const detailsPath = isAdmin 
    ? `/admin/complaints/${complaint._id}` 
    : `/app/complaints/${complaint._id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <CategoryIcon category={complaint.category} className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                {complaint.title}
              </h3>
              <p className="text-xs text-gray-500">ID: {complaint.complaintId}</p>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {!isCompact && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {complaint.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
            <span className="truncate">{complaint.location.address}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={complaint.priority} />
            {complaint.status === 'in-progress' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </span>
            )}
          </div>
          <Link
            to={detailsPath}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;