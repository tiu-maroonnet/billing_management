import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentIcon,
  WifiIcon,
  CreditCardIcon,
  TicketIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import CustomerService, { Customer } from '../../services/customer.service';
import ServiceService, { Service } from '../../services/service.service';
import InvoiceService, { Invoice } from '../../services/invoice.service';
import TicketService, { Ticket } from '../../services/ticket.service';
import { usePermissions } from '../../hooks/useAuth';
import StatusBadge from '../Common/StatusBadge';
import TabNavigation from '../Common/TabNavigation';

interface CustomerDetailProps {
  customerId: number;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId }) => {
  const router = useRouter();
  const permissions = usePermissions();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerData, servicesData, invoicesData, ticketsData] = await Promise.all([
        CustomerService.getCustomer(customerId),
        ServiceService.getCustomerServices(customerId),
        InvoiceService.getCustomerInvoices(customerId),
        TicketService.getCustomerTickets(customerId),
      ]);
      
      setCustomer(customerData);
      setServices(servicesData);
      setInvoices(invoicesData);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      await CustomerService.deleteCustomer(customerId);
      router.push('/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
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
      month: 'long',
      year: 'numeric',
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'services', name: 'Services', icon: WifiIcon, count: services.length },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon, count: invoices.length },
    { id: 'tickets', name: 'Tickets', icon: TicketIcon, count: tickets.length },
    { id: 'documents', name: 'Documents', icon: DocumentIcon },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-500">The customer you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/customers')}
          className="mt-6 text-maroon-600 hover:text-maroon-700 font-medium"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Customer Header */}
      <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 rounded-t-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-maroon-700 text-2xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge status={customer.status} large />
                <span className="text-maroon-200">Customer ID: {customer.id}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {permissions.canEditCustomers && (
              <button
                onClick={() => router.push(`/customers/${customerId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-maroon-700 bg-white hover:bg-gray-100"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            {permissions.canEditCustomers && (
              <button
                onClick={handleDeleteCustomer}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Info */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-gray-900 whitespace-pre-line">{customer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-gray-900">{formatDate(customer.subscription_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Customer Type</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.type === 'corporate' ? 'bg-purple-100 text-purple-800' :
                          customer.type === 'soho' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {customer.notes && (
                  <div className="md:col-span-2 bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                    <p className="text-gray-700 whitespace-pre-line">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-maroon-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Services</span>
                    <span className="font-semibold text-gray-900">
                      {services.filter(s => s.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Invoices</span>
                    <span className="font-semibold text-red-600">
                      {invoices.filter(i => i.status === 'unpaid').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Open Tickets</span>
                    <span className="font-semibold text-yellow-600">
                      {tickets.filter(t => t.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/services/create?customer=${customerId}`)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                  >
                    <span>Add New Service</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => router.push(`/invoices/create?customer=${customerId}`)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                  >
                    <span>Create Invoice</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => router.push(`/tickets/create?customer=${customerId}`)}
                    className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                  >
                    <span>Create Ticket</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Active Services</h3>
              <button
                onClick={() => router.push(`/services/create?customer=${customerId}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <WifiIcon className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <WifiIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No services found for this customer</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.plan?.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          service.type === 'pppoe' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {service.type === 'pppoe' ? 'PPPoE' : 'Static IP'}
                        </span>
                      </div>
                      <StatusBadge status={service.status} />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      {service.type === 'pppoe' ? (
                        <p>Username: <span className="font-medium">{service.username}</span></p>
                      ) : (
                        <p>IP Address: <span className="font-medium">{service.static_ip}</span></p>
                      )}
                      <p>Router: <span className="font-medium">{service.router?.name}</span></p>
                      <p>Started: <span className="font-medium">{formatDate(service.start_date)}</span></p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => router.push(`/services/${service.id}`)}
                        className="text-sm text-maroon-600 hover:text-maroon-700 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
              <button
                onClick={() => router.push(`/invoices/create?customer=${customerId}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No invoices found for this customer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4">{invoice.invoice_number}</td>
                        <td className="px-6 py-4">
                          {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                        </td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(invoice.total)}</td>
                        <td className="px-6 py-4">{formatDate(invoice.due_date)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge 
                            status={invoice.status === 'paid' ? 'active' : 
                                   invoice.status === 'overdue' ? 'suspended' : 'pending'} 
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                            className="text-maroon-600 hover:text-maroon-700 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
              <button
                onClick={() => router.push(`/tickets/create?customer=${customerId}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <TicketIcon className="h-4 w-4 mr-2" />
                New Ticket
              </button>
            </div>
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tickets found for this customer</p>
                <p className="text-sm text-gray-400 mt-2">All support requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            #{ticket.ticket_number}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Created: {formatDate(ticket.created_at)}
                      </span>
                      <button
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                        className="text-sm text-maroon-600 hover:text-maroon-700 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Customer Documents</h3>
            {customer.document_uploads && customer.document_uploads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.document_uploads.map((doc: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-maroon-600 hover:text-maroon-700"
                      >
                        View Document
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents uploaded</p>
                <p className="text-sm text-gray-400 mt-2">
                  Upload KTP, SIM, or other identification documents
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;