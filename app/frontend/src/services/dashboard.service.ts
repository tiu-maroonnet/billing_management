import api from './api.config';
import { AxiosResponse } from 'axios';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingInvoices: number;
  totalRevenue: number;
  activeServices: number;
  pendingTickets: number;
  monthlyRevenue: {
    labels: string[];
    data: number[];
  };
  customerGrowth: {
    labels: string[];
    data: number[];
  };
}

export interface RecentActivity {
  id: number;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  resource_type: string;
  resource_id?: number;
  timestamp: string;
  icon: string;
  color: string;
}

export interface UpcomingInvoice {
  id: number;
  invoice_number: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  service: {
    id: number;
    name: string;
    type: 'pppoe' | 'static';
  };
  amount: number;
  due_date: string;
  days_until_due: number;
  status: 'draft' | 'unpaid' | 'paid' | 'overdue';
}

export interface SystemStat {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response: AxiosResponse<{ status: string; data: DashboardStats }> = 
        await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response: AxiosResponse<{ status: string; data: RecentActivity[] }> = 
        await api.get('/dashboard/recent-activities');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  /**
   * Get upcoming invoices
   */
  async getUpcomingInvoices(): Promise<UpcomingInvoice[]> {
    try {
      const response: AxiosResponse<{ status: string; data: UpcomingInvoice[] }> = 
        await api.get('/dashboard/upcoming-invoices');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming invoices:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStat[]> {
    try {
      const response: AxiosResponse<{ status: string; data: SystemStat[] }> = 
        await api.get('/dashboard/system-stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  /**
   * Get summary report
   */
  async getSummaryReport(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    try {
      const response: AxiosResponse = await api.get('/reports/summary', {
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching summary report:', error);
      throw error;
    }
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(startDate?: string, endDate?: string) {
    try {
      const response: AxiosResponse = await api.get('/reports/revenue', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  }

  /**
   * Get customer growth report
   */
  async getCustomerGrowthReport(months: number = 12) {
    try {
      const response: AxiosResponse = await api.get('/reports/customer-growth', {
        params: { months }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customer growth report:', error);
      throw error;
    }
  }

  /**
   * Get quick actions data
   */
  async getQuickActions() {
    try {
      const response: AxiosResponse = await api.get('/dashboard/quick-actions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      throw error;
    }
  }

  /**
   * Export dashboard data
   */
  async exportData(type: 'pdf' | 'excel' | 'csv') {
    try {
      const response: AxiosResponse = await api.get(`/dashboard/export/${type}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();