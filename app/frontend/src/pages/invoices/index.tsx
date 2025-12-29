import React from 'react';
import Layout from '../../components/Layout';
import InvoiceList from '../../components/Invoices/InvoiceList';
import { useRequireAuth } from '../../hooks/useAuth';

const InvoicesPage: React.FC = () => {
  useRequireAuth();
  
  return (
    <Layout title="Invoices - Maroon-NET BCMS">
      <div className="space-y-6">
        <InvoiceList />
      </div>
    </Layout>
  );
};

export default InvoicesPage;