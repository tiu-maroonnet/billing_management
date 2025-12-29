import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ServerIcon,
  WifiIcon,
  ComputerDesktopIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import ServiceService, { Service, ServiceFilter } from '../../services/service.service';
import { usePermissions } from '../../hooks/useAuth';
import Pagination from '../Common/Pagination';
import StatusBadge from '../Common/StatusBadge';

const ServiceList: React.FC = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ServiceFilter>({
    status: 'all',
    type: 'all',
    page: 1,
    per_page: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await ServiceService.getServices(filters);
      setServices(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof ServiceFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSuspendService = async (id: number) => {
    if (!window.confirm('Are you sure you want to suspend this service?')) return;
    
    try {
      await ServiceService.suspendService(id);
      fetchServices();
    } catch (error) {
      console.error('Failed to suspend service:', error);
    }
  };

  const handleReactivateService = async (id: number) => {
    try {
      await ServiceService.reactivateService(id);
      fetchServices();
    } catch (error) {
      console.error('Failed to reactivate service:', error);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await ServiceService.deleteService(id);
      fetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'pppoe': return <WifiIcon className="h-5 w-5" />;
      case 'static': return <ComputerDesktopIcon className="h-5 w-5" />;
      default: return <ServerIcon className="h-5 w-5" />;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'pppoe': return 'bg-purple-100 text-purple-800';
      case 'static': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Services</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage internet services and configurations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissions.canManageServices && (
              <button
                onClick={() => router.push('/services/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Service
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
                placeholder="Search services by username, IP, or customer..."
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
                    <option value="pppoe">PPPoE</option>
                    <option value="static">Static IP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Router</label>
                  <select
                    value={filters.router_id}
                    onChange={(e) => handleFilterChange('router_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="">All Routers</option>
                    {/* Populate with routers from API */}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan</label>
                  <select
                    value={filters.plan_id}
                    onChange={(e) => handleFilterChange('plan_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="">All Plans</option>
                    {/* Populate with plans from API */}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Configuration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Router
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
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <ServerIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No services found</p>
                    {permissions.canManageServices && (
                      <button
                        onClick={() => router.push('/services/create')}
                        className="mt-4 text-maroon-600 hover:text-maroon-700 font-medium"
                      >
                        Add your first service
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${getServiceTypeColor(service.type)}`}>
                        {getServiceIcon(service.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {service.plan?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {service.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{service.customer?.name}</div>
                    <div className="text-xs text-gray-500">{service.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceTypeColor(service.type)}`}>
                      {service.type === 'pppoe' ? 'PPPoE' : 'Static IP'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {service.type === 'pppoe' ? (
                        <>Username: <span className="font-mono">{service.username}</span></>
                      ) : (
                        <>IP: <span className="font-mono">{service.static_ip}</span></>
                      )}
                    </div>
                    {service.mac_address && (
                      <div className="text-xs text-gray-500">
                        MAC: <span className="font-mono">{service.mac_address}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{service.router?.name}</div>
                    <div className="text-xs text-gray-500">{service.router?.ip_address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/services/${service.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {permissions.canManageServices && (
                        <button
                          onClick={() => router.push(`/services/${service.id}/edit`)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {permissions.canManageServices && service.status === 'active' && (
                        <button
                          onClick={() => handleSuspendService(service.id)}
                          className="text-yellow-400 hover:text-yellow-600"
                          title="Suspend"
                        >
                          <PauseCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {permissions.canManageServices && service.status === 'suspended' && (
                        <button
                          onClick={() => handleReactivateService(service.id)}
                          className="text-green-400 hover:text-green-600"
                          title="Reactivate"
                        >
                          <PlayCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {permissions.canManageServices && (
                        <button
                          onClick={() => handleDeleteService(service.id)}
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
      {!loading && services.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(filters.page - 1) * filters.per_page + 1}</span> to{' '}
              <span className="font-medium">{Math.min(filters.page * filters.per_page, services.length)}</span> of{' '}
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

export default ServiceList;