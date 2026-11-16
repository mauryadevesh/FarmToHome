import React from 'react';
import AdminOrderManagement from './AdminOrderManagement';
import { PageTransition } from '../UI/Motion';

const AdminOrders = () => {
  return (
    <PageTransition className="admin-page">
      <div className="page-header">
        <h1>Manage Orders</h1>
        <p>View and manage customer orders</p>
      </div>
      <div className="page-content">
        <AdminOrderManagement />
      </div>
    </PageTransition>
  );
};

export default AdminOrders;
