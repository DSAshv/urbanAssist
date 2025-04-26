import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    low: {
      icon: AlertCircle,
      color: 'bg-green-100 text-green-800',
      label: 'Low Priority'
    },
    medium: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Medium Priority'
    },
    high: {
      icon: AlertOctagon,
      color: 'bg-orange-100 text-orange-800',
      label: 'High Priority'
    },
    urgent: {
      icon: AlertOctagon,
      color: 'bg-red-100 text-red-800',
      label: 'Urgent'
    }
  };

  const { icon: Icon, color, label } = config[priority];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default PriorityBadge;