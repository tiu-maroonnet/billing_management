import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ServerIcon,
  KeyIcon,
  LockClosedIcon,
  WifiIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import RouterService, { RouterFormData } from '../../services/router.service';
import { useAuth } from '../../hooks/useAuth';

interface RouterFormProps {
  routerId?: number;
  onSubmit?: (router: any) => void;
  onCancel?: () => void;
}

const RouterForm: React.FC<RouterFormProps> = ({ routerId, onSubmit, onCancel }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RouterFormData>({
    name: '',
    ip_address: '',
    api_port: 8729,
    username: '',
    password: '',
    tls_enabled: true,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTestConnection = async () => {
    if (!validateForm(true)) return;

    try {
      setTesting(true);
      setTestResult(null);
      
      const result = await RouterService.testConnection(formData);
      setTestResult(result);
      
      if (!result.success) {
        setErrors(prev => ({ ...prev, connection: result.error }));
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Connection test failed',
      });
      setErrors(prev => ({ ...prev, connection: 'Connection test failed' }));
    } finally {
      setTesting(false);
    }
  };

  const validateForm = (testOnly = false) => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Router name is required';
    }

    if (!formData.ip_address.trim()) {
      newErrors.ip_address = 'IP address is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip_address)) {
      newErrors.ip_address = 'Invalid IP address format';
    }

    if (!formData.api_port) {
      newErrors.api_port = 'API port is required';
    } else if (formData.api_port < 1 || formData.api_port > 65535) {
      newErrors.api_port = 'Port must be between 1 and 65535';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!testOnly && !testResult?.success) {
      newErrors.connection = 'Please test connection before saving';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      let routerData: any;
      if (routerId) {
        // Update existing router
        routerData = await RouterService.updateRouter(routerId, formData);
      } else {
        // Create new router
        routerData = await RouterService.createRouter(formData);
      }

      if (onSubmit) {
        onSubmit(routerData);
      } else {
        router.push(`/routers/${routerData.id}`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save router. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {routerId ? 'Edit Router' : 'Add New Router'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {routerId ? 'Update router configuration' : 'Add a new Mikrotik router to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Router Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Router Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Router Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ServerIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Main Router - Tower A"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IP Address *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <WifiIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="ip_address"
                      value={formData.ip_address}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.ip_address ? 'border-red-300' : ''
                      }`}
                      placeholder="192.168.88.1"
                    />
                  </div>
                  {errors.ip_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.ip_address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Port *
                  </label>
                  <input
                    type="number"
                    name="api_port"
                    value={formData.api_port}
                    onChange={handleChange}
                    min="1"
                    max="65535"
                    className={`block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.api_port ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.api_port && (
                    <p className="mt-1 text-sm text-red-600">{errors.api_port}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Default Mikrotik API port: 8728 (HTTP), 8729 (HTTPS)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="tls_enabled"
                    checked={formData.tls_enabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 flex items-center text-sm text-gray-700">
                    <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                    Enable TLS/SSL
                  </label>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.username ? 'border-red-300' : ''
                      }`}
                      placeholder="admin_api"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.password ? 'border-red-300' : ''
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Test */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Connection Test</h3>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </p>
                      <p className={`text-sm ${
                        testResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResult.success 
                          ? `Router: ${testResult.data?.identity || 'Unknown'} | Uptime: ${testResult.data?.uptime || 'N/A'}`
                          : testResult.error
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.connection && (
                <p className="mt-2 text-sm text-red-600">{errors.connection}</p>
              )}
            </div>
          </div>

          {/* Right Column - Notes and Security */}
          <div className="space-y-6">
            {/* Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={10}
                className="block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                placeholder="Additional notes about this router..."
              />
            </div>

            {/* Security Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                Security Recommendations
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Use dedicated API user with limited permissions
                </li>
                <li className="flex items-start">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Enable TLS/SSL for encrypted connections
                </li>
                <li className="flex items-start">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Restrict API access to specific IP addresses
                </li>
                <li className="flex items-start">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Use strong, unique passwords
                </li>
              </ul>
            </div>

            {/* Mikrotik Setup Guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mikrotik Setup</h3>
              <p className="text-sm text-gray-600 mb-3">
                On your Mikrotik router, ensure the following:
              </p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Enable API service: <code className="bg-gray-100 px-1">/ip service set api disabled=no</code></li>
                <li>Set API port: <code className="bg-gray-100 px-1">/ip service set api port=8729</code></li>
                <li>Create API user: <code className="bg-gray-100 px-1">/user add name=admin_api group=full password=your_password</code></li>
                {formData.tls_enabled && (
                  <li>Enable TLS: <code className="bg-gray-100 px-1">/ip service set api tls-version=only-1.2</code></li>
                )}
              </ol>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || (testResult && !testResult.success)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                  {routerId ? 'Updating...' : 'Creating...'}
                </>
              ) : routerId ? (
                'Update Router'
              ) : (
                'Create Router'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RouterForm;