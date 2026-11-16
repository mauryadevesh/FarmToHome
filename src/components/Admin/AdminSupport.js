import React from 'react';
import AdminSupportManagement from './AdminSupportManagement';
import { PageTransition } from '../UI/Motion';

const AdminSupport = () => {
  return (
    <PageTransition className="admin-page">
      <div className="page-header">
        <h1>Support Tickets</h1>
        <p>Manage customer and farmer support requests</p>
      </div>
      <div className="page-content">
        <AdminSupportManagement />
      </div>
    </PageTransition>
  );
};

export default AdminSupport;
