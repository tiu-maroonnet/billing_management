import React from 'react';
import Layout from '../../components/Layout';
import CustomerList from '../../components/Customers/CustomerList';
import { useRequireAuth } from '../../hooks/useAuth';

const CustomersPage: React.FC = () => {
  useRequireAuth();
  
  return (
    <Layout title="Customers - Maroon-NET BCMS">
      <div className="space-y-6">
        <CustomerList />
      </div>
    </Layout>
  );
};

export default CustomersPage;