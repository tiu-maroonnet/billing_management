import api from './api.config';

export interface Customer {
  id: number;
  type: 'resident' | 'soho' | 'corporate';
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_date: string;
  document_uploads: any[];
  status: 'active' | 'suspended' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
  services_count?: number;
  invoices_count?: number;
  tickets_count?: number;
}

export interface CustomerFilter {
  search?: string;
  status?: string;
  type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CustomerFormData {
  type: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_date: string;
  status: string;
  notes?: string;
}

class CustomerService {
  /**
   * Get customers with optional filters
   */
  async getCustomers(filters: CustomerFilter = {}) {
    const response = await api.get('/customers', { params: filters });
    return response.data.data;
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  }

  /**
   * Create new customer
   */
  async createCustomer(data: CustomerFormData): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data.data;
  }

  /**
   * Update existing customer
   */
  async updateCustomer(id: number, data: Partial<CustomerFormData>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  }

  /**
   * Get customer services
   */
  async getCustomerServices(customerId: number) {
    const response = await api.get(`/customers/${customerId}/services`);
    return response.data.data;
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: number) {
    const response = await api.get(`/customers/${customerId}/invoices`);
    return response.data.data;
  }

  /**
   * Upload customer document
   */
  async uploadDocument(customerId: number, file: File) {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post(`/customers/${customerId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  /**
   * Export customers
   */
  async exportCustomers(format: 'excel' | 'pdf' | 'csv', filters: CustomerFilter = {}) {
    const response = await api.get(`/customers/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Get customer statistics
   */
  async getStatistics() {
    const response = await api.get('/customers/statistics');
    return response.data.data;
  }
}

export default new CustomerService();