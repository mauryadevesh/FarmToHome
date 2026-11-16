import React from 'react';
import AdminProductManagement from './AdminProductManagement';

const AdminProducts = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Products</h1>
        <p>Add, edit, or remove products from the marketplace</p>
      </div>
      <div className="page-content">
        <AdminProductManagement />
      </div>
    </div>
  );
};

export default AdminProducts;
