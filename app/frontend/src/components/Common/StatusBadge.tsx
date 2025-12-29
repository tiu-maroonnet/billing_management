import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/outline';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated' | 'paid' | 'unpaid' | 'overdue' | 'draft';
  large?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, large = false }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
      case 'paid':
        return {
          icon: CheckCircleIcon,
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-500',
          text: status === 'paid' ? 'Paid' : 'Active',
        };
      case 'suspended':
      case 'overdue':
        return {
          icon: ExclamationTriangleIcon,
          color: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-500',
          text: status === 'overdue' ? 'Overdue' : 'Suspended',
        };
      case 'pending':
      case 'unpaid':
        return {
          icon: ClockIcon,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-500',
          text: status === 'unpaid' ? 'Unpaid' : 'Pending',
        };
      case 'inactive':
      case 'terminated':
        return {
          icon: XCircleIcon,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-500',
          text: status === 'terminated' ? 'Terminated' : 'Inactive',
        };
      case 'draft':
        return {
          icon: PauseCircleIcon,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-500',
          text: 'Draft',
        };
      default:
        return {
          icon: ClockIcon,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-500',
          text: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClass = large ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}
    >
      <Icon className={`mr-1.5 ${large ? 'h-4 w-4' : 'h-3 w-3'} ${config.iconColor}`} />
      {config.text}
    </span>
  );
};

export default StatusBadge;