import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CreditCardIcon, 
  WifiIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { dashboardService, RecentActivity } from '../../services/dashboard.service';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getRecentActivities();
      setActivities(data.slice(0, 5)); // Show only 5 most recent
    } catch (err) {
      setError('Failed to load recent activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'customer':
        return <UserIcon className="h-5 w-5" />;
      case 'invoice':
      case 'payment':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'service':
        return <WifiIcon className="h-5 w-5" />;
      case 'ticket':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <CheckCircleIcon className="h-5 w-5" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'suspend':
        return 'bg-yellow-100 text-yellow-800';
      case 'activate':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (activity: RecentActivity) => {
    const action = activity.action.toLowerCase();
    const resource = activity.resource_type.toLowerCase();
    
    switch (action) {
      case 'create':
        return `created new ${resource}`;
      case 'update':
        return `updated ${resource}`;
      case 'delete':
        return `deleted ${resource}`;
      case 'suspend':
        return `suspended ${resource}`;
      case 'activate':
        return `activated ${resource}`;
      case 'payment':
        return `received payment for ${resource}`;
      default:
        return `${action} ${resource}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchRecentActivities}
            className="mt-4 text-sm text-maroon-600 hover:text-maroon-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          <button
            onClick={fetchRecentActivities}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.color}`}>
                    {getActivityIcon(activity.resource_type)}
                  </div>
                </div>

                {/* Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: id
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {getActionText(activity)}
                    {activity.resource_id && (
                      <span className="font-medium"> #{activity.resource_id}</span>
                    )}
                  </p>
                  
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.action)}`}>
                      {activity.action}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="ml-4 flex-shrink-0">
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <a
            href="/activities"
            className="text-sm font-medium text-maroon-600 hover:text-maroon-700 flex items-center justify-center"
          >
            View all activities
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;