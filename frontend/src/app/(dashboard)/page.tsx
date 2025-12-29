'use client'

import React from 'react'
import { 
  Users, 
  Wifi, 
  CreditCard, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react'
import StatsCard from '@/components/Dashboard/StatsCard'
import RecentActivities from '@/components/Dashboard/RecentActivities'
import QuickActions from '@/components/Dashboard/QuickActions'
import SystemStatus from '@/components/Dashboard/SystemStatus'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency } from '@/utils/formatters'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Selamat datang di Maroon-NET Billing & Customer Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pelanggan"
          value={stats?.total_customers || 0}
          icon={Users}
          change={5.2}
          subtitle="Aktif: 245"
          color="primary"
        />
        <StatsCard
          title="Layanan Aktif"
          value={stats?.active_services || 0}
          icon={Wifi}
          change={3.1}
          subtitle="PPPoE: 180, Static: 65"
          color="success"
        />
        <StatsCard
          title="Pendapatan Bulan Ini"
          value={formatCurrency(stats?.monthly_revenue || 0)}
          icon={DollarSign}
          change={12.5}
          subtitle="Target: 95%"
          color="info"
        />
        <StatsCard
          title="Tagihan Tertunggak"
          value={stats?.overdue_invoices || 0}
          icon={AlertCircle}
          change={-2.3}
          subtitle={`Total: ${formatCurrency(stats?.overdue_amount || 0)}`}
          color="danger"
        />
      </div>

      {/* Charts and Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pendapatan 6 Bulan Terakhir
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tren pertumbuhan pendapatan
                </p>
              </div>
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <TrendingUp size={20} />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            {/* Chart would go here */}
            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Chart Component</p>
            </div>
          </div>

          {/* Recent Activities */}
          <RecentActivities />
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* System Status */}
          <SystemStatus />

          {/* Router Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status Router
              </h3>
              <Activity size={20} className="text-green-500" />
            </div>
            <div className="space-y-4">
              {stats?.routers?.map((router: any) => (
                <div key={router.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {router.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {router.location}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${router.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium capitalize">
                      {router.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}