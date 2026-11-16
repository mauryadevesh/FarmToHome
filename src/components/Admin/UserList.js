import React, { useState, useEffect } from 'react';
import { FaUser, FaUserTie, FaUserShield, FaClock, FaTrash, FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition, motion } from '../UI/Motion';
import './UserList.css';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminUsers();
      setUsers(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to load user records. Please check server connectivity.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      setError(null);
      await api.updateUserRole(userId, newRole);
      setSuccess(`User role successfully changed to ${newRole}.`);
      setUsers(prev => prev.map(u => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const currentId = currentUser?.id || currentUser?._id;
    if (userId === currentId) {
      alert('You cannot delete your own administrative account.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove "${userName}"? This will delete all account records.`)) {
      try {
        setUpdatingId(userId);
        setError(null);
        await api.deleteUser(userId);
        setSuccess(`User "${userName}" has been deleted.`);
        setUsers(prev => prev.filter(u => u.id !== userId && u._id !== userId));
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield className="role-icon admin" />;
      case 'farmer': return <FaUserTie className="role-icon farmer" />;
      default: return <FaUser className="role-icon consumer" />;
    }
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'Recently registered';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently registered';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'No logins recorded';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No logins recorded';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || (
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const countByRole = (r) => users.filter(u => u.role === r).length;

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading">Loading user registry...</div>
      </div>
    );
  }

  return (
    <PageTransition className="user-list-container">
      <div className="section-header">
        <h1>User Account Management</h1>
        <p>Oversee registered rural farmers, urban consumers, and platform administrators.</p>
      </div>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar with Search and Filter Pills */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRoleFilter('all')}
          >
            All Accounts ({users.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${roleFilter === 'farmer' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRoleFilter('farmer')}
          >
            Farmers ({countByRole('farmer')})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${roleFilter === 'consumer' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRoleFilter('consumer')}
          >
            Consumers ({countByRole('consumer')})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${roleFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRoleFilter('admin')}
          >
            Admins ({countByRole('admin')})
          </button>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="user-grid">
        {filteredUsers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px', color: 'var(--color-muted)' }}>
            No accounts match your search filter.
          </div>
        ) : (
          filteredUsers.map((u, idx) => {
            const uid = u.id || u._id;
            const isSelf = uid === (currentUser?.id || currentUser?._id);
            const joinedDate = u.createdAt || u.created_at;
            const lastLoginDate = u.lastLogin || u.last_login;

            return (
              <motion.div
                key={uid}
                className="user-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.25) }}
              >
                <div className="user-header">
                  {getRoleIcon(u.role)}
                  <h3>
                    {u.name} {isSelf && <small style={{ color: 'var(--color-accent)', fontWeight: 'normal' }}>(You)</small>}
                  </h3>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </div>

                <div className="user-details">
                  <p><strong>Email:</strong> {u.email}</p>
                  {u.phone && <p><strong>Phone:</strong> {u.phone}</p>}
                  {u.address && <p><strong>Address:</strong> {u.address}</p>}
                  <p>
                    <FaClock style={{ marginRight: '4px', color: 'var(--color-muted)' }} />
                    <strong>Joined:</strong> {formatJoinedDate(joinedDate)}
                  </p>
                  {lastLoginDate && (
                    <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      <strong>Last Active:</strong> {formatLastLogin(lastLoginDate)}
                    </p>
                  )}
                </div>

                {/* Admin Operations Row */}
                <div className="user-card-actions" style={{ marginTop: '12px', paddingTop: '10px', borderTop: 'var(--rule-hair) solid var(--color-rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Role:</span>
                    <select
                      className="status-select"
                      value={u.role}
                      disabled={updatingId === uid || isSelf}
                      onChange={(e) => handleRoleChange(uid, e.target.value)}
                    >
                      <option value="consumer">Consumer</option>
                      <option value="farmer">Farmer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {!isSelf && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(uid, u.name)}
                      disabled={updatingId === uid}
                      title="Delete User"
                      style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
};

export default UserList;
