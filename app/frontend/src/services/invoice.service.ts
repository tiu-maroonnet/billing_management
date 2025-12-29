import api from './api.config';

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  service_id: number;
  period_start: string;
  period_end: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  due_date: string;
  status: 'draft' | 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  items: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  service?: {
    id: number;
    plan?: {
      name: string;
    };
  };
}

export interface InvoiceFilter {
  search?: string;
  status?: string;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface InvoiceFormData {
  customer_id: number | string;
  service_id: number | string;
  period_start: string;
  period_end: string;
  items: any[];
  discount: number;
  tax_rate: number;
  notes?: string;
}

class InvoiceService {
  /**
   * Get invoices with optional filters
   */
  async getInvoices(filters: InvoiceFilter = {}) {
    const response = await api.get('/invoices', { params: filters });
    return response.data.data;
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(id: number): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  }

  /**
   * Create new invoice
   */
  async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    const response = await api.post('/invoices', data);
    return response.data.data;
  }

  /**
   * Update existing invoice
   */
  async updateInvoice(id: number, data: Partial<InvoiceFormData>): Promise<Invoice> {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: number): Promise<void> {
    await api.delete(`/invoices/${id}`);
  }

  /**
   * Generate monthly invoices
   */
  async generateMonthlyInvoices(): Promise<void> {
    await api.post('/invoices/generate-monthly');
  }

  /**
   * Send payment reminder
   */
  async sendReminder(invoiceId: number): Promise<void> {
    await api.post(`/invoices/${invoiceId}/send-reminder`);
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(invoiceId: number): Promise<void> {
    await api.post(`/invoices/${invoiceId}/mark-paid`);
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: number) {
    const response = await api.get(`/customers/${customerId}/invoices`);
    return response.data.data;
  }

  /**
   * Export invoices
   */
  async exportInvoices(format: 'excel' | 'pdf' | 'csv', filters: InvoiceFilter = {}) {
    const response = await api.get(`/invoices/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Get invoice statistics
   */
  async getStatistics() {
    const response = await api.get('/invoices/statistics');
    return response.data.data;
  }
}

export default new InvoiceService();