import React from 'react';
import Layout from '../../components/Layout';
import TicketList from '../../components/Tickets/TicketList';
import { useRequireAuth } from '../../hooks/useAuth';

const TicketsPage: React.FC = () => {
  useRequireAuth();
  
  return (
    <Layout title="Tickets - Maroon-NET BCMS">
      <div className="space-y-6">
        <TicketList />
      </div>
    </Layout>
  );
};

export default TicketsPage;