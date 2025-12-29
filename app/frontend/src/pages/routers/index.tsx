import React from 'react';
import Layout from '../../components/Layout';
import RouterList from '../../components/Routers/RouterList';
import { useRequireAuth } from '../../hooks/useAuth';

const RoutersPage: React.FC = () => {
  useRequireAuth();
  
  return (
    <Layout title="Routers - Maroon-NET BCMS">
      <div className="space-y-6">
        <RouterList />
      </div>
    </Layout>
  );
};

export default RoutersPage;