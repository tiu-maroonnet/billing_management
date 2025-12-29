import api from './api.config';

export interface Payment {
  id: number;
  invoice_id: number;
  payment_number: string;
  method: 'bank_transfer' | 'credit_card' | 'virtual_account' | 'cash' | 'ewallet';
  gateway?: string;
  amount: number;
  admin_fee: number;
  total: number;
  reference?: string;
  proof?: string;
  status: 'pending' | 'verified' | 'rejected';
  paid_at?: string;
  verified_at?: string;
  verified_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  invoice?: {
    invoice_number: string;
    customer?: {
      name: string;
    };
  };
}

export interface PaymentFilter {
  search?: string;
  status?: string;
  method?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaymentFormData {
  invoice_id: number | string;
  method: string;
  amount: number;
  admin_fee?: number;
  reference?: string;
  proof?: File;
  paid_at: string;
  notes?: string;
}

class PaymentService {
  /**
   * Get payments with optional filters
   */
  async getPayments(filters: PaymentFilter = {}) {
    const response = await api.get('/payments', { params: filters });
    return response.data.data;
  }

  /**
   * Get single payment by ID
   */
  async getPayment(id: number): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  }

  /**
   * Create new payment
   */
  async createPayment(data: PaymentFormData): Promise<Payment> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'proof' && data.proof) {
        formData.append('proof', data.proof);
      } else {
        formData.append(key, data[key as keyof PaymentFormData] as string);
      }
    });

    const response = await api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  /**
   * Update existing payment
   */
  async updatePayment(id: number, data: Partial<PaymentFormData>): Promise<Payment> {
    const response = await api.put(`/payments/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete payment
   */
  async deletePayment(id: number): Promise<void> {
    await api.delete(`/payments/${id}`);
  }

  /**
   * Verify payment
   */
  async verifyPayment(id: number): Promise<void> {
    await api.post(`/payments/${id}/verify`);
  }

  /**
   * Reject payment
   */
  async rejectPayment(id: number): Promise<void> {
    await api.post(`/payments/${id}/reject`);
  }

  /**
   * Get invoice payments
   */
  async getInvoicePayments(invoiceId: number) {
    const response = await api.get(`/invoices/${invoiceId}/payments`);
    return response.data.data;
  }

  /**
   * Export payments
   */
  async exportPayments(format: 'excel' | 'pdf' | 'csv', filters: PaymentFilter = {}) {
    const response = await api.get(`/payments/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Get payment statistics
   */
  async getStatistics() {
    const response = await api.get('/payments/statistics');
    return response.data.data;
  }
}

export default new PaymentService();