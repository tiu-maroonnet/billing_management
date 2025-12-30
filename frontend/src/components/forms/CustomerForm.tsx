// frontend/src/components/forms/CustomerForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Customer } from '../../types/customer';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'residential',
      status: 'active',
    },
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informasi Dasar</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe Pelanggan *
            </label>
            <select
              {...register('type', { required: 'Tipe pelanggan harus diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            >
              <option value="residential">Residential</option>
              <option value="soho">SOHO (Small Office Home Office)</option>
              <option value="corporate">Corporate</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Lengkap *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Nama harus diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nomor Telepon *
            </label>
            <input
              type="tel"
              {...register('phone', { required: 'Nomor telepon harus diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Alamat</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alamat Lengkap *
            </label>
            <textarea
              {...register('address', { required: 'Alamat harus diisi' })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provinsi
              </label>
              <input
                type="text"
                {...register('province')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kota
              </label>
              <input
                type="text"
                {...register('city')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kecamatan
              </label>
              <input
                type="text"
                {...register('district')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kode Pos
              </label>
              <input
                type="text"
                {...register('postal_code')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Informasi Tambahan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nomor KTP
            </label>
            <input
              type="text"
              {...register('id_card_number')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Berlangganan
            </label>
            <input
              type="date"
              {...register('subscription_date', { required: 'Tanggal berlangganan harus diisi' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            />
            {errors.subscription_date && (
              <p className="mt-1 text-sm text-red-600">{errors.subscription_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
            >
              <option value="active">Aktif</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="terminated">Dihentikan</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Catatan
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </span>
          ) : (
            initialData ? 'Perbarui Pelanggan' : 'Tambah Pelanggan'
          )}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;