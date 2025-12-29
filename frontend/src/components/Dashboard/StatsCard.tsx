import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  subtitle?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const colorClasses = {
  primary: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  success: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  info: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  subtitle,
  color = 'primary'
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {change !== undefined && (
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}