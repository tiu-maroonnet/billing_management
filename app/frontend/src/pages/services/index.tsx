import React from 'react';
import Layout from '../../components/Layout';
import ServiceList from '../../components/Services/ServiceList';
import { useRequireAuth } from '../../hooks/useAuth';

const ServicesPage: React.FC = () => {
  useRequireAuth();
  
  return (
    <Layout title="Services - Maroon-NET BCMS">
      <div className="space-y-6">
        <ServiceList />
      </div>
    </Layout>
  );
};

export default ServicesPage;