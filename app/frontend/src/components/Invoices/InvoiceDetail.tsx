import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  PrinterIcon,
  EnvelopeIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import InvoiceService, { Invoice } from '../../services/invoice.service';
import PaymentService, { Payment } from '../../services/payment.service';
import { usePermissions } from '../../hooks/useAuth';
import StatusBadge from '../Common/StatusBadge';
import PaymentList from '../Payments/PaymentList';

interface InvoiceDetailProps {
  invoiceId: number;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId }) => {
  const router = useRouter();
  const permissions = usePermissions();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const [invoiceData, paymentsData] = await Promise.all([
        InvoiceService.getInvoice(invoiceId),
        PaymentService.getInvoicePayments(invoiceId),
      ]);
      
      setInvoice(invoiceData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to fetch invoice data:', error);
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!window.confirm('Send payment reminder to customer?')) return;
    
    try {
      setSendingReminder(true);
      await InvoiceService.sendReminder(invoiceId);
      alert('Reminder sent successfully');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!window.confirm('Mark this invoice as paid?')) return;
    
    try {
      setMarkingPaid(true);
      await InvoiceService.markAsPaid(invoiceId);
      fetchInvoiceData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await InvoiceService.deleteInvoice(invoiceId);
      router.push('/invoices');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
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

  const calculateDaysOverdue = () => {
    if (!invoice || invoice.status !== 'overdue') return 0;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusIcon = () => {
    if (!invoice) return null;
    
    switch (invoice.status) {
      case 'paid': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'overdue': return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'unpaid': return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      default: return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Not Found</h3>
        <p className="text-gray-500">The invoice you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/invoices')}
          className="mt-6 text-maroon-600 hover:text-maroon-700 font-medium"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const daysOverdue = calculateDaysOverdue();
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = invoice.total - totalPaid;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 rounded-t-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{invoice.invoice_number}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge 
                  status={invoice.status === 'paid' ? 'active' : 
                         invoice.status === 'overdue' ? 'suspended' : 'pending'} 
                  large 
                />
                <span className="text-maroon-200">
                  {invoice.status === 'overdue' ? `${daysOverdue} days overdue` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => window.open(`/api/invoices/${invoiceId}/print`, '_blank')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-maroon-700 bg-white hover:bg-gray-100"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleSendReminder}
              disabled={sendingReminder || invoice.status === 'paid'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </button>
            {permissions.canEditInvoices && invoice.status !== 'paid' && (
              <button
                onClick={() => router.push(`/payments/create?invoice=${invoiceId}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Record Payment
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2">
            {/* Invoice Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                      <p className="text-gray-900">{formatDate(invoice.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Date</p>
                      <p className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(invoice.due_date)}
                        {invoice.status === 'overdue' && ` (${daysOverdue} days ago)`}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-gray-900">{invoice.customer?.name}</p>
                      <p className="text-sm text-gray-500">{invoice.customer?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service</p>
                      <p className="text-gray-900">{invoice.service?.plan?.name}</p>
                      <p className="text-sm text-gray-500">
                        Period: {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Unit Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Summary and Actions */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
                {payments.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Paid</span>
                        <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                      </div>
                    </div>
                    {remainingBalance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining Balance</span>
                        <span className="font-medium text-red-600">{formatCurrency(remainingBalance)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge 
                    status={invoice.status === 'paid' ? 'active' : 
                           invoice.status === 'overdue' ? 'suspended' : 'pending'} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {payments.length > 0 
                      ? payments[0].method.charAt(0).toUpperCase() + payments[0].method.slice(1)
                      : 'Not Paid'
                    }
                  </span>
                </div>
                {payments.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Payment</span>
                    <span className="font-medium">{formatDate(payments[0].paid_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`/api/invoices/${invoiceId}/download`, '_blank')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  <span>Download PDF</span>
                  <ArrowDownTrayIcon className="h-4 w-4 text-gray-400" />
                </button>
                {permissions.canEditInvoices && invoice.status !== 'paid' && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={markingPaid}
                    className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50"
                  >
                    <span className="text-green-700">{markingPaid ? 'Marking...' : 'Mark as Paid'}</span>
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  </button>
                )}
                {permissions.canEditInvoices && (
                  <button
                    onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                    className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    <span className="text-blue-700">Edit Invoice</span>
                    <PencilIcon className="h-4 w-4 text-blue-500" />
                  </button>
                )}
                {permissions.canEditInvoices && (
                  <button
                    onClick={handleDeleteInvoice}
                    className="w-full flex items-center justify-between p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    <span className="text-red-700">Delete Invoice</span>
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-maroon-50 border border-maroon-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Bank Transfer</p>
                  <p>Bank: Bank Mandiri</p>
                  <p>Account: 1234567890</p>
                  <p>Name: PT. Trira Inti Utama</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Virtual Account</p>
                  <p className="font-mono">8880 1234 5678 90</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments History */}
        {payments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
            <PaymentList payments={payments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;