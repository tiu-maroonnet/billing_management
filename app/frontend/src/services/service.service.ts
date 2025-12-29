import api from './api.config';

export interface Service {
  id: number;
  customer_id: number;
  plan_id: number;
  router_id: number;
  type: 'pppoe' | 'static';
  username?: string;
  password_encrypted?: string;
  static_ip?: string;
  mac_address?: string;
  start_date: string;
  due_day: number;
  status: 'active' | 'suspended' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  plan?: {
    id: number;
    name: string;
    rate_limit_down: number;
    rate_limit_up: number;
  };
  router?: {
    id: number;
    name: string;
    ip_address: string;
  };
}

export interface ServiceFilter {
  search?: string;
  status?: string;
  type?: string;
  router_id?: number;
  plan_id?: number;
  customer_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ServiceFormData {
  customer_id: number | string;
  plan_id: number | string;
  router_id: number | string;
  type: 'pppoe' | 'static';
  username: string;
  password: string;
  static_ip: string;
  mac_address: string;
  start_date: string;
  due_day: number;
  status: string;
  notes?: string;
}

class ServiceService {
  /**
   * Get services with optional filters
   */
  async getServices(filters: ServiceFilter = {}) {
    const response = await api.get('/services', { params: filters });
    return response.data.data;
  }

  /**
   * Get single service by ID
   */
  async getService(id: number): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data.data;
  }

  /**
   * Create new service
   */
  async createService(data: ServiceFormData): Promise<Service> {
    const response = await api.post('/services', data);
    return response.data.data;
  }

  /**
   * Update existing service
   */
  async updateService(id: number, data: Partial<ServiceFormData>): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete service
   */
  async deleteService(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  }

  /**
   * Suspend service
   */
  async suspendService(id: number): Promise<void> {
    await api.post(`/services/${id}/suspend`);
  }

  /**
   * Reactivate service
   */
  async reactivateService(id: number): Promise<void> {
    await api.post(`/services/${id}/reactivate`);
  }

  /**
   * Terminate service
   */
  async terminateService(id: number): Promise<void> {
    await api.post(`/services/${id}/terminate`);
  }

  /**
   * Get customer services
   */
  async getCustomerServices(customerId: number) {
    const response = await api.get(`/customers/${customerId}/services`);
    return response.data.data;
  }

  /**
   * Test service connectivity
   */
  async testConnectivity(serviceId: number) {
    const response = await api.post(`/services/${serviceId}/test-connectivity`);
    return response.data.data;
  }

  /**
   * Get service statistics
   */
  async getStatistics() {
    const response = await api.get('/services/statistics');
    return response.data.data;
  }
}

export default new ServiceService();