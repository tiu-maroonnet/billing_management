import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  ServerIcon,
  PlusIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import RouterService, { Router } from '../../services/router.service';
import { usePermissions } from '../../hooks/useAuth';
import StatusBadge from '../Common/StatusBadge';

const RouterList: React.FC = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [routers, setRouters] = useState<Router[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<number | null>(null);

  useEffect(() => {
    fetchRouters();
  }, []);

  const fetchRouters = async () => {
    try {
      setLoading(true);
      const data = await RouterService.getRouters();
      setRouters(data);
    } catch (error) {
      console.error('Failed to fetch routers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (routerId: number) => {
    try {
      setTesting(routerId);
      const result = await RouterService.testConnection(routerId);
      if (result.success) {
        alert('Connection test successful!');
        fetchRouters(); // Refresh to update status
      } else {
        alert(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('Connection test failed');
    } finally {
      setTesting(null);
    }
  };

  const handleDeleteRouter = async (routerId: number) => {
    if (!window.confirm('Are you sure you want to delete this router?')) return;
    
    try {
      await RouterService.deleteRouter(routerId);
      fetchRouters();
    } catch (error) {
      console.error('Failed to delete router:', error);
    }
  };

  const getRouterStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'maintenance': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default: return <ServerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceCount = (router: Router) => {
    return router.services_count || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mikrotik Routers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage network routers and configurations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissions.canManageServices && (
              <button
                onClick={() => router.push('/routers/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Router
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Router Grid */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : routers.length === 0 ? (
          <div className="text-center py-12">
            <ServerIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No routers configured</p>
            {permissions.canManageServices && (
              <button
                onClick={() => router.push('/routers/create')}
                className="mt-4 text-maroon-600 hover:text-maroon-700 font-medium"
              >
                Add your first router
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routers.map((router) => (
              <div key={router.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Router Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <ServerIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{router.name}</h3>
                      <p className="text-sm text-gray-500">{router.ip_address}:{router.api_port}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRouterStatusIcon(router.status)}
                    <StatusBadge status={router.status === 'online' ? 'active' : 'suspended'} />
                  </div>
                </div>

                {/* Router Details */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span className="font-medium">{getServiceCount(router)} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TLS</span>
                    <span className="font-medium">
                      {router.tls_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check</span>
                    <span className="font-medium">
                      {new Date(router.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Capabilities */}
                {router.capabilities && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {router.capabilities.pppoe_server && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          <WifiIcon className="h-3 w-3 mr-1" />
                          PPPoE
                        </span>
                      )}
                      {router.capabilities.queue_simple && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Queue
                        </span>
                      )}
                      {router.capabilities.firewall_address_list && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Firewall
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestConnection(router.id)}
                        disabled={testing === router.id}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        <ArrowPathIcon className={`h-4 w-4 mr-1 ${testing === router.id ? 'animate-spin' : ''}`} />
                        {testing === router.id ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => router.push(`/routers/${router.id}`)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        View
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permissions.canManageServices && (
                        <button
                          onClick={() => router.push(`/routers/${router.id}/edit`)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {permissions.canManageServices && getServiceCount(router) === 0 && (
                        <button
                          onClick={() => handleDeleteRouter(router.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouterList;