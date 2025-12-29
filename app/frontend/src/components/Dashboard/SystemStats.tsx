import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  ChartBarIcon,
  WifiIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { dashboardService, SystemStat } from '../../services/dashboard.service';

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const data = await dashboardService.getSystemStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      server: <ServerIcon className="h-6 w-6" />,
      cpu: <CpuChipIcon className="h-6 w-6" />,
      database: <CircleStackIcon className="h-6 w-6" />,
      chart: <ChartBarIcon className="h-6 w-6" />,
      network: <WifiIcon className="h-6 w-6" />,
      users: <UserGroupIcon className="h-6 w-6" />,
      alert: <ExclamationTriangleIcon className="h-6 w-6" />,
      success: <CheckCircleIcon className="h-6 w-6" />,
      error: <XCircleIcon className="h-6 w-6" />,
    };
    return iconMap[iconName] || <ChartBarIcon className="h-6 w-6" />;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
    };
    return colorMap[color] || colorMap.gray;
  };

  if (loading && stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Statistics</h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time system performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchSystemStats}
              className="text-sm text-maroon-600 hover:text-maroon-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const colorClasses = getColorClasses(stat.color);
            
            return (
              <div
                key={stat.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`inline-flex p-3 rounded-lg ${colorClasses.bg}`}>
                      <div className={colorClasses.text}>
                        {getIcon(stat.icon)}
                      </div>
                    </div>
                  </div>
                  
                  {stat.trend && (
                    <div className={`flex items-center text-sm ${
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend.isPositive ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>{stat.trend.value}%</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {stat.value}
                    {stat.unit && (
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {stat.unit}
                      </span>
                    )}
                  </p>
                </div>

                {/* Progress bar for usage metrics */}
                {(stat.label.includes('Usage') || stat.label.includes('Load')) && 
                 typeof stat.value === 'string' && stat.value.includes('/') && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Usage</span>
                      <span>{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-maroon-600 h-1.5 rounded-full"
                        style={{ 
                          width: `${Math.min(
                            (parseInt(stat.value.toString().split('/')[0]) / 
                             parseInt(stat.value.toString().split('/')[1])) * 100, 
                            100
                          )}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System Health Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-900 mb-4">System Health Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800">All Systems Operational</span>
              </div>
              <p className="text-sm text-green-600 mt-1">No critical issues detected</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ServerIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-800">Routers: 3/3 Online</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">All Mikrotik routers connected</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-800">3 Services Pending</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Require attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;