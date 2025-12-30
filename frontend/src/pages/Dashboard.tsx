// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CustomerList from '../components/dashboard/CustomerList';
import SystemMonitor from '../components/dashboard/SystemMonitor';
import {
  UsersIcon,
  WifiIcon,
  CurrencyDollarIcon,
  ExclamationIcon,
  TicketIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/outline';

const Dashboard: React.FC = () => {
  const { stats, loading, error, fetchStats } = useDashboard();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading dashboard data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Ringkasan kinerja sistem Maroon-NET</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
          >
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pelanggan"
          value={stats?.customers.total || 0}
          icon={UsersIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          change={{
            value: stats?.customers.new_this_month || 0,
            label: 'baru bulan ini',
            positive: true,
          }}
        />
        <StatsCard
          title="Layanan Aktif"
          value={stats?.services.active || 0}
          icon={WifiIcon}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          change={{
            value: Math.round(((stats?.services.active || 0) / (stats?.services.total || 1)) * 100),
            label: 'dari total',
            positive: true,
            isPercentage: true,
          }}
        />
        <StatsCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${(stats?.financial.monthly_revenue || 0).toLocaleString('id-ID')}`}
          icon={CurrencyDollarIcon}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          change={{
            value: 15.2,
            label: 'dari bulan lalu',
            positive: true,
            isPercentage: true,
          }}
        />
        <StatsCard
          title="Tiket Terbuka"
          value={stats?.tickets.open || 0}
          icon={TicketIcon}
          iconColor="text-red-600"
          bgColor="bg-red-50"
          change={{
            value: stats?.tickets.resolved_today || 0,
            label: 'terselesaikan hari ini',
            positive: true,
          }}
        />
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Grafik Pendapatan</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'week' ? 'bg-maroon-100 text-maroon-700' : 'text-gray-600'}`}
                >
                  Minggu
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'month' ? 'bg-maroon-100 text-maroon-700' : 'text-gray-600'}`}
                >
                  Bulan
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'year' ? 'bg-maroon-100 text-maroon-700' : 'text-gray-600'}`}
                >
                  Tahun
                </button>
              </div>
            </div>
            <RevenueChart timeRange={timeRange} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h2>
            <SystemMonitor />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tagihan Jatuh Tempo</h2>
              <span className="text-sm text-red-600 font-medium">
                Rp {(stats?.financial.overdue || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Belum Dibayar</span>
                <span className="text-sm font-medium">
                  {stats?.invoices.unpaid || 0} tagihan
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Terlambat</span>
                <span className="text-sm font-medium text-red-600">
                  {stats?.invoices.overdue || 0} tagihan
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dibayar Hari Ini</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.invoices.paid_today || 0} tagihan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pelanggan Terbaru</h2>
        </div>
        <CustomerList />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span>Tambah Pelanggan</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <WifiIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span>Aktivasi Layanan</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span>Buat Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;