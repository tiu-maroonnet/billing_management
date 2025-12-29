import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface QuickStat {
  id: number;
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: React.ReactNode;
  color: string;
}

interface QuickStatsProps {
  period?: 'today' | 'week' | 'month';
}

const QuickStats: React.FC<QuickStatsProps> = ({ period = 'today' }) => {
  // Mock data - replace with API call
  const stats: QuickStat[] = [
    {
      id: 1,
      title: 'New Customers',
      value: 12,
      change: { value: 8, isPositive: true, label: 'vs last week' },
      icon: <UserPlusIcon className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Revenue',
      value: 'Rp 45.2M',
      change: { value: 12, isPositive: true, label: 'vs last month' },
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 3,
      title: 'Paid Invoices',
      value: '89%',
      change: { value: 5, isPositive: true, label: 'vs last month' },
      icon: <DocumentCheckIcon className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 4,
      title: 'Pending Issues',
      value: 7,
      change: { value: 3, isPositive: false, label: 'vs yesterday' },
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'Today';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
          <span className="text-sm text-gray-500">{getPeriodLabel()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {stats.map((stat) => (
          <div key={stat.id} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              {stat.change.isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{stat.change.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;