import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import RecentActivities from '../../components/Dashboard/RecentActivities';
import UpcomingInvoices from '../../components/Dashboard/UpcomingInvoices';
import SystemStats from '../../components/Dashboard/SystemStats';
import RevenueChart from '../../components/Dashboard/RevenueChart';
import QuickStats from '../../components/Dashboard/QuickStats';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';
import {
  UserGroupIcon,
  WifiIcon,
  CreditCardIcon,
  TicketIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, revenueData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRevenueReport(),
      ]);
      
      setStats(statsData);
      setRevenueData({
        labels: revenueData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: revenueData.data || [12000000, 19000000, 15000000, 25000000, 22000000, 30000000],
          },
        ],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardData = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <UserGroupIcon className="h-8 w-8" />,
      iconColor: 'text-blue-600',
      trend: { value: 12, isPositive: true, label: 'from last month' },
      subtitle: `${stats?.activeCustomers || 0} active customers`,
    },
    {
      title: 'Active Services',
      value: stats?.activeServices || 0,
      icon: <WifiIcon className="h-8 w-8" />,
      iconColor: 'text-green-600',
      trend: { value: 8, isPositive: true, label: 'from last month' },
      subtitle: '3 pending activations',
    },
    {
      title: 'Pending Invoices',
      value: stats?.pendingInvoices || 0,
      icon: <CreditCardIcon className="h-8 w-8" />,
      iconColor: 'text-yellow-600',
      trend: { value: -3, isPositive: false, label: 'from last week' },
      subtitle: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')} total revenue`,
    },
    {
      title: 'Open Tickets',
      value: stats?.pendingTickets || 0,
      icon: <TicketIcon className="h-8 w-8" />,
      iconColor: 'text-red-600',
      trend: { value: 5, isPositive: false, label: 'from yesterday' },
      subtitle: '2 high priority',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with Maroon-NET today.
              </p>
            </div>
            <div className="hidden md:block">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>

        {/* System Stats */}
        <SystemStats />

        {/* Revenue Chart and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {revenueData && (
              <RevenueChart
                data={revenueData}
                title="Monthly Revenue Trend"
                height={350}
              />
            )}
          </div>
          <div>
            <RecentActivities />
          </div>
        </div>

        {/* Upcoming Invoices */}
        <UpcomingInvoices />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-maroon-500 hover:bg-maroon-50 transition-colors group">
                <UserGroupIcon className="h-8 w-8 text-gray-400 group-hover:text-maroon-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-maroon-700">Add Customer</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                <CreditCardIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Create Invoice</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400 group-hover:text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Record Payment</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                <TicketIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">New Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;