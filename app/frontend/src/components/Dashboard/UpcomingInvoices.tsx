import React, { useState, useEffect } from 'react';
import { 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { dashboardService, UpcomingInvoice } from '../../services/dashboard.service';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { id } from 'date-fns/locale';

const UpcomingInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<UpcomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    fetchUpcomingInvoices();
  }, []);

  const fetchUpcomingInvoices = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getUpcomingInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch upcoming invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: UpcomingInvoice['status'], daysUntilDue: number) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusIcon = (status: UpcomingInvoice['status'], daysUntilDue: number) => {
    if (status === 'paid') return <CheckCircleIcon className="h-5 w-5" />;
    if (status === 'overdue') return <ExclamationCircleIcon className="h-5 w-5" />;
    if (daysUntilDue <= 3) return <ExclamationCircleIcon className="h-5 w-5" />;
    return <ClockIcon className="h-5 w-5" />;
  };

  const getFilteredInvoices = () => {
    switch (filter) {
      case 'overdue':
        return invoices.filter(inv => inv.status === 'overdue' || isPast(new Date(inv.due_date)));
      case 'upcoming':
        return invoices.filter(inv => inv.status === 'unpaid' && !isPast(new Date(inv.due_date)));
      default:
        return invoices;
    }
  };

  const filteredInvoices = getFilteredInvoices();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Invoices</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="mt-2 h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Invoices</h2>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
            >
              <option value="all">All Invoices</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <button
              onClick={fetchUpcomingInvoices}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredInvoices.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === 'overdue' 
                ? 'No overdue invoices' 
                : filter === 'upcoming'
                ? 'No upcoming invoices'
                : 'No invoices available'
              }
            </p>
          </div>
        ) : (
          filteredInvoices.slice(0, 5).map((invoice) => {
            const isOverdue = invoice.status === 'overdue' || isPast(new Date(invoice.due_date));
            
            return (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status, invoice.days_until_due)}`}>
                          {getStatusIcon(invoice.status, invoice.days_until_due)}
                          <span className="ml-1">
                            {invoice.status === 'paid' 
                              ? 'Paid' 
                              : isOverdue
                              ? 'Overdue'
                              : invoice.days_until_due <= 3
                              ? 'Due Soon'
                              : 'Upcoming'
                            }
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>{invoice.customer.name}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        <span>{invoice.customer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        <span>{invoice.customer.email}</span>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        invoice.service.type === 'pppoe' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.service.type === 'pppoe' ? 'PPPoE' : 'Static IP'}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {invoice.service.name}
                      </span>
                    </div>

                    {/* Amount and Due Date */}
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          Due {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: id })}
                          {!isOverdue && invoice.days_until_due > 0 && (
                            <span className="ml-2">
                              ({invoice.days_until_due} days remaining)
                            </span>
                          )}
                          {isOverdue && (
                            <span className="ml-2 font-medium">
                              {formatDistanceToNow(new Date(invoice.due_date), {
                                addSuffix: true,
                                locale: id
                              })}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="text-sm font-medium text-maroon-600 hover:text-maroon-700">
                          View
                        </button>
                        {invoice.status !== 'paid' && (
                          <button className="text-sm font-medium text-green-600 hover:text-green-700">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredInvoices.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <a
            href="/invoices"
            className="flex items-center justify-center text-sm font-medium text-maroon-600 hover:text-maroon-700"
          >
            View all invoices
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default UpcomingInvoices;