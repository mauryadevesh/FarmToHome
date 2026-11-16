import React, { useState, useEffect } from 'react';
import { FaUser, FaUserTie, FaUserShield, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { PageTransition, motion } from '../UI/Motion';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(Array.isArray(response) ? response : []);
      } catch (err) {
        setError('Failed to load users. Please try again.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield className="role-icon admin" />;
      case 'farmer': return <FaUserTie className="role-icon farmer" />;
      default: return <FaUser className="role-icon consumer" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never logged in';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <PageTransition className="user-list-container">
      <h1>User Management</h1>
      <div className="user-grid">
        {users.map((user, idx) => (
          <motion.div
            key={user._id}
            className="user-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.04, 0.3) }}
          >
            <div className="user-header">
              {getRoleIcon(user.role)}
              <h3>{user.name}</h3>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>
            <div className="user-details">
              <p><strong>Email:</strong> {user.email}</p>
              {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
              {user.address && <p><strong>Address:</strong> {user.address}</p>}
              <p><FaClock /> Joined: {formatDate(user.createdAt || user.lastLogin)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
};

export default UserList;
