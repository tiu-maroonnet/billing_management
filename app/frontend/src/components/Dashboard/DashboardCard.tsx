import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  helpText?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'text-blue-600',
  trend,
  subtitle,
  onClick,
  loading = false,
  className = '',
  helpText,
}) => {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
            {helpText && (
              <div className="group relative">
                <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {helpText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {trend && (
                  <div className={`ml-2 flex items-center text-sm font-medium ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="ml-1">
                      {trend.value}% {trend.label && `(${trend.label})`}
                    </span>
                  </div>
                )}
              </div>
              
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
              )}
            </>
          )}
        </div>
        
        {icon && (
          <div className={`ml-4 flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Progress bar for trend visualization */}
      {trend && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                trend.isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized card variations
export const StatCard: React.FC<Omit<DashboardCardProps, 'icon'>> = (props) => {
  return <DashboardCard {...props} />;
};

export const MetricCard: React.FC<DashboardCardProps & { 
  format?: 'currency' | 'number' | 'percentage';
  prefix?: string;
  suffix?: string;
}> = ({ 
  format = 'number', 
  prefix = '', 
  suffix = '', 
  value, 
  ...props 
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      switch (format) {
        case 'currency':
          return `Rp ${val.toLocaleString('id-ID')}`;
        case 'percentage':
          return `${val}%`;
        case 'number':
        default:
          return val.toLocaleString('id-ID');
      }
    }
    return val;
  };

  return (
    <DashboardCard
      {...props}
      value={`${prefix}${formatValue(value)}${suffix}`}
    />
  );
};

export const ActionCard: React.FC<DashboardCardProps & {
  actionLabel?: string;
  actionIcon?: React.ReactNode;
}> = ({ 
  actionLabel = 'View Details', 
  actionIcon,
  onClick,
  ...props 
}) => {
  return (
    <DashboardCard {...props} onClick={onClick}>
      <div className="mt-4">
        <button
          className="inline-flex items-center text-sm font-medium text-maroon-600 hover:text-maroon-700"
          onClick={onClick}
        >
          {actionLabel}
          {actionIcon || (
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </DashboardCard>
  );
};

export default DashboardCard;