import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentIcon,
  CameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import CustomerService, { Customer } from '../../services/customer.service';
import { useAuth } from '../../hooks/useAuth';

interface CustomerFormProps {
  customerId?: number;
  onSubmit?: (customer: Customer) => void;
  onCancel?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, onSubmit, onCancel }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    type: 'resident',
    name: '',
    email: '',
    phone: '',
    address: '',
    subscription_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const customer = await CustomerService.getCustomer(customerId!);
      setFormData({
        type: customer.type,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        subscription_date: customer.subscription_date.split('T')[0],
        status: customer.status,
        notes: customer.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      router.push('/customers');
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
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, document: 'File size must be less than 5MB' }));
      return;
    }

    if (!file.type.match('image/(jpeg|png|jpg)|application/pdf')) {
      setErrors(prev => ({ ...prev, document: 'Only JPG, PNG, and PDF files are allowed' }));
      return;
    }

    setDocumentFile(file);
    setDocumentPreview(URL.createObjectURL(file));
    if (errors.document) {
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
      
      let customerData: Customer;
      if (customerId) {
        // Update existing customer
        customerData = await CustomerService.updateCustomer(customerId, formData);
      } else {
        // Create new customer
        customerData = await CustomerService.createCustomer(formData);
      }

      // Upload document if provided
      if (documentFile) {
        await CustomerService.uploadDocument(customerData.id, documentFile);
      }

      if (onSubmit) {
        onSubmit(customerData);
      } else {
        router.push(`/customers/${customerData.id}`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save customer. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
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
          {customerId ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {customerId ? 'Update customer information' : 'Create a new customer profile'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="resident">Resident</option>
                    <option value="soho">SOHO (Small Office/Home Office)</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                      placeholder="customer@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                        errors.phone ? 'border-red-300' : ''
                      }`}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Complete Address *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={4}
                    className={`block w-full pl-10 border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500 ${
                      errors.address ? 'border-red-300' : ''
                    }`}
                    placeholder="Jl. Example No. 123, City, Postal Code"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document (KTP/SIM/Passport)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {documentPreview ? (
                        <div className="relative">
                          <img
                            src={documentPreview}
                            alt="Document preview"
                            className="mx-auto h-32 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDocumentPreview(null);
                              setDocumentFile(null);
                            }}
                            className="absolute top-0 right-0 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-maroon-600 hover:text-maroon-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleDocumentUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.document && (
                    <p className="mt-1 text-sm text-red-600">{errors.document}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subscription Date *
                  </label>
                  <input
                    type="date"
                    name="subscription_date"
                    value={formData.subscription_date}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-maroon-500 focus:border-maroon-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-maroon-500 focus:border-maroon-500"
                    placeholder="Additional notes about this customer..."
                  />
                </div>
              </div>
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
                  Saving...
                </>
              ) : customerId ? (
                'Update Customer'
              ) : (
                'Create Customer'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;