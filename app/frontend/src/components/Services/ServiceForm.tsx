import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  WifiIcon,
  ComputerDesktopIcon,
  UserIcon,
  ServerIcon,
  CreditCardIcon,
  KeyIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import ServiceService, { Service, ServiceFormData } from '../../services/service.service';
import CustomerService from '../../services/customer.service';
import RouterService from '../../services/router.service';
import PlanService from '../../services/plan.service';
import { useAuth } from '../../hooks/useAuth';

interface ServiceFormProps {
  serviceId?: number;
  customerId?: number;
  onSubmit?: (service: Service) => void;
  onCancel?: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, customerId, onSubmit, onCancel }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [routers, setRouters] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [formData, setFormData] = useState<ServiceFormData>({
    customer_id: customerId || '',
    plan_id: '',
    router_id: '',
    type: 'pppoe',
    username: '',
    password: '',
    static_ip: '',
    mac_address: '',
    start_date: new Date().toISOString().split('T')[0],
    due_day: 10,
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    fetchFormData();
    if (serviceId) {
      fetchServiceData();
    }
  }, []);

  const fetchFormData = async () => {
    try {
      const [customersData, routersData, plansData] = await Promise.all([
        CustomerService.getCustomers({ per_page: 100 }),
        RouterService.getRouters(),
        PlanService.getPlans(),
      ]);
      
      setCustomers(customersData.data);
      setRouters(routersData);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
    }
  };

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const service = await ServiceService.getService(serviceId!);
      setFormData({
        customer_id: service.customer_id,
        plan_id: service.plan_id,
        router_id: service.router_id,
        type: service.type,
        username: service.username || '',
        password: '',
        static_ip: service.static_ip || '',
        mac_address: service.mac_address || '',
        start_date: service.start_date.split('T')[0],
        due_day: service.due_day,
        status: service.status,
        notes: service.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch service:', error);
      router.push('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-generate username for PPPoE
    if (name === 'customer_id' && formData.type === 'pppoe' && !formData.username) {
      const customer = customers.find(c => c.id === parseInt(value));
      if (customer) {
        const username = `${customer.name.toLowerCase().replace(/\s+/g, '.')}.${customer.id}`;
        setFormData(prev => ({ ...prev, username }));
      }
    }

    // Auto-generate password if empty
    if (name === 'type' && !formData.password && value === 'pppoe') {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      setFormData(prev => ({ ...prev, password: randomPassword }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.plan_id) {
      newErrors.plan_id = 'Plan is required';
    }

    if (!formData.router_id) {
      newErrors.router_id = 'Router is required';
    }

    if (formData.type === 'pppoe') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required for PPPoE';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required for PPPoE';
      }
    } else {
      if (!formData.static_ip.trim()) {
        newErrors.static_ip = 'IP Address is required for Static IP';
      }
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (formData.due_day < 1 || formData.due_day > 31) {
      newErrors.due_day = 'Due day must be between 1 and 31';
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
      
      let serviceData: Service;
      if (serviceId) {
        // Update existing service
        serviceData = await ServiceService.updateService(serviceId, formData);
      } else {
        // Create new service
        serviceData = await ServiceService.createService(formData);
      }

      if (onSubmit) {
        onSubmit(serviceData);
      } else {
        router.push(`/services/${serviceData.id}`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save service. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {serviceId ? 'Edit Service' : 'Add New Service'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {serviceId ? 'Update service configuration' : 'Provision a new internet service'}
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
            {/* Service Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'pppoe' }))}
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                    formData.type === 'pppoe'
                      ? 'border-maroon-500 bg-maroon-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <WifiIcon className={`h-8 w-8 mx-auto mb-2 ${
                    formData.type === 'pppoe' ? 'text-maroon-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium">PPPoE</p>
                  <p className="text-sm text-gray-500">Dynamic authentication</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'static' }))}
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                    formData.type === 'static'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <ComputerDesktopIcon className={`h-8 w-8 mx-auto mb-2 ${
                    formData.type === 'static' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium">Static IP</p>
                  <p className="text-sm text-gray-500">Fixed IP address</p>
                </button>
              </div>
            </div>

            {/* Customer and Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.customer_id ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.customer_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Internet Plan *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="plan_id"
                    value={formData.plan_id}
                    onChange={handleChange}
                    className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.plan_id ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.rate_limit_down/1000} Mbps
                      </option>
                    ))}
                  </select>
                </div>
                {errors.plan_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                )}
              </div>
            </div>

            {/* Router Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Router *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ServerIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="router_id"
                  value={formData.router_id}
                  onChange={handleChange}
                  className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                    errors.router_id ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select Router</option>
                  {routers.map(router => (
                    <option key={router.id} value={router.id}>
                      {router.name} ({router.ip_address})
                    </option>
                  ))}
                </select>
              </div>
              {errors.router_id && (
                <p className="mt-1 text-sm text-red-600">{errors.router_id}</p>
              )}
            </div>

            {/* Service Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formData.type === 'pppoe' ? 'PPPoE Configuration' : 'Static IP Configuration'}
              </h3>
              
              {formData.type === 'pppoe' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                          errors.username ? 'border-red-300' : ''
                        }`}
                        placeholder="customer.username"
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
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                          errors.password ? 'border-red-300' : ''
                        }`}
                        placeholder="Strong password"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-maroon-600 hover:text-maroon-700"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      IP Address *
                    </label>
                    <input
                      type="text"
                      name="static_ip"
                      value={formData.static_ip}
                      onChange={handleChange}
                      className={`block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.static_ip ? 'border-red-300' : ''
                      }`}
                      placeholder="192.168.1.100"
                    />
                    {errors.static_ip && (
                      <p className="mt-1 text-sm text-red-600">{errors.static_ip}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      MAC Address (Optional)
                    </label>
                    <input
                      type="text"
                      name="mac_address"
                      value={formData.mac_address}
                      onChange={handleChange}
                      className="block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                      placeholder="AA:BB:CC:DD:EE:FF"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Additional Settings */}
          <div className="space-y-6">
            {/* Service Schedule */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.start_date ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Billing Due Day *
                  </label>
                  <input
                    type="number"
                    name="due_day"
                    value={formData.due_day}
                    onChange={handleChange}
                    min="1"
                    max="31"
                    className={`mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.due_day ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.due_day && (
                    <p className="mt-1 text-sm text-red-600">{errors.due_day}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Day of the month when invoice is due (1-31)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pointer-events-none pt-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={6}
                  className="block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  placeholder="Additional notes about this service..."
                />
              </div>
            </div>

            {/* Auto Configuration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Auto Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                This service will be automatically configured on the selected router.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Create {formData.type === 'pppoe' ? 'PPPoE secret' : 'Static IP binding'}
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Configure bandwidth queue
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Generate first invoice
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Send credentials to customer
                </li>
              </ul>
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
              disabled={saving}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                  {serviceId ? 'Updating...' : 'Creating...'}
                </>
              ) : serviceId ? (
                'Update Service'
              ) : (
                'Create Service'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;