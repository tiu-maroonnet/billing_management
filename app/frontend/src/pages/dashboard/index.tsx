import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import RecentActivities from '../../components/Dashboard/RecentActivities';
import UpcomingInvoices from '../../components/Dashboard/UpcomingInvoices';
import SystemStats from '../../components/Dashboard/SystemStats';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboard.service';

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingInvoices: number;
  totalRevenue: number;
  activeServices: number;
  pendingTickets: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with Maroon-NET today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon="👥"
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Active Services"
            value={stats?.activeServices || 0}
            icon="📡"
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <DashboardCard
            title="Pending Invoices"
            value={stats?.pendingInvoices || 0}
            icon="💰"
            color="yellow"
            trend={{ value: -3, isPositive: false }}
          />
          <DashboardCard
            title="Open Tickets"
            value={stats?.pendingTickets || 0}
            icon="🎫"
            color="red"
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* System Stats */}
        <SystemStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <RecentActivities />

          {/* Upcoming Invoices */}
          <UpcomingInvoices />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-maroon-600 hover:bg-maroon-700 text-white py-3 px-4 rounded-lg transition-colors">
              Add Customer
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
              Create Invoice
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
              New Payment
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;