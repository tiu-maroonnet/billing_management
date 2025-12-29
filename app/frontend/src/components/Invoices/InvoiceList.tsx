import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PrinterIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import InvoiceService, { Invoice, InvoiceFilter } from '../../services/invoice.service';
import { usePermissions } from '../../hooks/useAuth';
import Pagination from '../Common/Pagination';
import StatusBadge from '../Common/StatusBadge';

const InvoiceList: React.FC = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InvoiceFilter>({
    status: 'all',
    page: 1,
    per_page: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await InvoiceService.getInvoices(filters);
      setInvoices(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof InvoiceFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      setExporting(true);
      await InvoiceService.exportInvoices(format, filters);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleSendReminder = async (invoiceId: number) => {
    if (!window.confirm('Send payment reminder to customer?')) return;
    
    try {
      await InvoiceService.sendReminder(invoiceId);
      alert('Reminder sent successfully');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'overdue': return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'unpaid': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default: return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage billing and invoicing
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissions.canCreateInvoices && (
              <button
                onClick={() => router.push('/invoices/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            )}
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices by number or customer..."
                className="pl-10 w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="all">All Status</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date From</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date To</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
                  <select
                    value={filters.per_page}
                    onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Unpaid</p>
            <p className="text-2xl font-bold text-yellow-600">
              {invoices.filter(i => i.status === 'unpaid').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">
              {invoices.filter(i => i.status === 'overdue').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No invoices found</p>
                    {permissions.canCreateInvoices && (
                      <button
                        onClick={() => router.push('/invoices/create')}
                        className="mt-4 text-maroon-600 hover:text-maroon-700 font-medium"
                      >
                        Create your first invoice
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(invoice.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(invoice.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{invoice.customer?.name}</div>
                    <div className="text-xs text-gray-500">{invoice.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tax: {formatCurrency(invoice.tax)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.due_date)}
                    </div>
                    {invoice.status === 'overdue' && (
                      <div className="text-xs text-red-600 font-medium">
                        Overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      status={invoice.status === 'paid' ? 'active' : 
                             invoice.status === 'overdue' ? 'suspended' : 'pending'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => window.open(`/api/invoices/${invoice.id}/print`, '_blank')}
                        className="text-blue-400 hover:text-blue-600"
                        title="Print"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(invoice.id)}
                            className="text-yellow-400 hover:text-yellow-600"
                            title="Send Reminder"
                          >
                            <EnvelopeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/payments/create?invoice=${invoice.id}`)}
                            className="text-green-400 hover:text-green-600"
                            title="Record Payment"
                          >
                            <CurrencyDollarIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && invoices.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(filters.page - 1) * filters.per_page + 1}</span> to{' '}
              <span className="font-medium">{Math.min(filters.page * filters.per_page, invoices.length)}</span> of{' '}
              <span className="font-medium">{totalPages * filters.per_page}</span> results
            </div>
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;