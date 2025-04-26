import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: <CheckCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: <XCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: <AlertTriangle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        };
    }
  };

  const { label, bgColor, textColor, icon } = getStatusConfig();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${bgColor} ${textColor} ${sizeClasses[size]} font-medium`}
    >
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;