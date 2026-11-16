import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserTie, FaUserShield, FaClock, FaInfoCircle } from 'react-icons/fa';
import api from '../../services/api';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="user-list-container">
      <h1>User Management</h1>
      <div className="user-grid">
        {users.map(user => (
          <div key={user._id} className="user-card">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
