import React from 'react';
import AdminOrderManagement from './AdminOrderManagement';

const AdminOrders = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Orders</h1>
        <p>View and manage customer orders</p>
      </div>
      <div className="page-content">
        <AdminOrderManagement />
      </div>
    </div>
  );
};

export default AdminOrders;
