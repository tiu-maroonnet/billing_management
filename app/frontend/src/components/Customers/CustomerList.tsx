import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  DocumentArrowDownIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import CustomerService, { Customer, CustomerFilter } from '../../services/customer.service';
import { usePermissions } from '../../hooks/useAuth';
import Pagination from '../Common/Pagination';
import StatusBadge from '../Common/StatusBadge';

interface CustomerListProps {
  onSelectCustomer?: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const router = useRouter();
  const permissions = usePermissions();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilter>({
    status: 'all',
    type: 'all',
    page: 1,
    per_page: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await CustomerService.getCustomers(filters);
      setCustomers(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof CustomerFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      setExporting(true);
      await CustomerService.exportCustomers(format, filters);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await CustomerService.deleteCustomer(id);
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'corporate': return 'bg-purple-100 text-purple-800';
      case 'soho': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your customer database
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissions.canCreateCustomers && (
              <button
                onClick={() => router.push('/customers/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Customer
              </button>
            )}
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
                placeholder="Search customers by name, email, or phone..."
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
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="all">All Types</option>
                    <option value="resident">Resident</option>
                    <option value="soho">SOHO</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="name">Name</option>
                    <option value="created_at">Date Created</option>
                    <option value="subscription_date">Subscription Date</option>
                  </select>
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

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedCustomers.length} customers selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCustomers([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear selection
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCustomers(customers.map(c => c.id));
                    } else {
                      setSelectedCustomers([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <UserPlusIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No customers found</p>
                    {permissions.canCreateCustomers && (
                      <button
                        onClick={() => router.push('/customers/create')}
                        className="mt-4 text-maroon-600 hover:text-maroon-700 font-medium"
                      >
                        Add your first customer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectCustomer?.(customer)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers(prev => [...prev, customer.id]);
                        } else {
                          setSelectedCustomers(prev => prev.filter(id => id !== customer.id));
                        }
                      }}
                      className="rounded border-gray-300 text-maroon-600 focus:ring-maroon-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-maroon-100 flex items-center justify-center">
                          <span className="text-maroon-600 font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.type)}`}>
                      {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center mt-1">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate max-w-xs">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(customer.subscription_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Member for {Math.floor((new Date().getTime() - new Date(customer.subscription_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/customers/${customer.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {permissions.canEditCustomers && (
                        <button
                          onClick={() => router.push(`/customers/${customer.id}/edit`)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {permissions.canEditCustomers && (
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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
      {!loading && customers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(filters.page - 1) * filters.per_page + 1}</span> to{' '}
              <span className="font-medium">{Math.min(filters.page * filters.per_page, customers.length)}</span> of{' '}
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

export default CustomerList;