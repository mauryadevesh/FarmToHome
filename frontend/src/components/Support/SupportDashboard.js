import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'other',
    priority: 'medium'
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSupportTickets();
      setTickets(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      message: '',
      category: 'other',
      priority: 'medium'
    });
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.subject.trim() || !formData.message.trim()) {
      setFormError('Subject and message are required');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.createSupportTicket(formData);
      resetForm();
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      setFormError(err.message || 'Failed to create support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const ticket = await apiService.getSupportTicket(ticketId);
      setSelectedTicket(ticket);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    }
  };

  const handleTicketClick = async (ticketId) => {
    try {
      const ticket = await apiService.getSupportTicket(ticketId);
      setSelectedTicket(ticket);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ff6b6b';
      case 'in_progress': return '#feca57';
      case 'resolved': return '#48dbfb';
      case 'closed': return '#c8d6e5';
      default: return '#c8d6e5';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#1dd1a1';
      case 'medium': return '#feca57';
      case 'high': return '#ff6b6b';
      default: return '#c8d6e5';
    }
  };

  if (loading) {
    return (
      <div className="support-dashboard-container">
        <div className="loading">Loading support tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="support-dashboard-container">
        <div className="error">
          <h3>Error loading support tickets</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchTickets}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="support-dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Customer Support</h1>
          <p>Get help with your orders, products, and account</p>
          <div className="admin-contact">
            <span>Need immediate help? Call Admin: </span>
            <a href="tel:7671014068" className="admin-phone">📞 7671014068</a>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Create New Ticket
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create Support Ticket</h2>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="support-form">
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleFormChange}>
                  <option value="order">Order Related</option>
                  <option value="product">Product Related</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleFormChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Describe your issue in detail..."
                  rows="5"
                  required
                />
              </div>
              {formError && <div className="error-message">{formError}</div>}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="btn btn-outline" onClick={() => setSelectedTicket(null)}>
                ×
              </button>
            </div>
            <div className="ticket-details">
              <div className="ticket-header">
                <h3>{selectedTicket.subject}</h3>
                <div className="ticket-meta">
                  <span className="status" style={{ backgroundColor: getStatusColor(selectedTicket.status) }}>
                    {selectedTicket.status}
                  </span>
                  <span className="priority" style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}>
                    {selectedTicket.priority}
                  </span>
                  <span className="category">{selectedTicket.category}</span>
                </div>
              </div>
              <div className="ticket-content">
                <div className="ticket-message">
                  <h4>Your Message:</h4>
                  <p>{selectedTicket.message}</p>
                </div>
                {selectedTicket.response && (
                  <div className="ticket-response">
                    <h4>Response:</h4>
                    <p>{selectedTicket.response}</p>
                    {selectedTicket.respondedBy && (
                      <p className="responded-by">
                        Responded by: {selectedTicket.respondedBy.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="ticket-footer">
                <small>
                  Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                </small>
                {selectedTicket.respondedAt && (
                  <small>
                    Responded: {new Date(selectedTicket.respondedAt).toLocaleString()}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {tickets.length === 0 ? (
          <div className="no-tickets">
            <h3>No support tickets yet</h3>
            <p>Create your first support ticket to get help with any issues.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Create Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map(ticket => (
              <div key={ticket._id} className="ticket-card" onClick={() => handleTicketClick(ticket._id)}>
                <div className="ticket-header">
                  <h4>{ticket.subject}</h4>
                  <div className="ticket-meta">
                    <span className="status" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                      {ticket.status}
                    </span>
                    <span className="priority" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <p className="ticket-preview">{ticket.message.substring(0, 100)}...</p>
                <div className="ticket-footer">
                  <span className="category">{ticket.category}</span>
                  <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .support-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .header-content {
          flex: 1;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #333;
        }

        .dashboard-header p {
          margin: 5px 0 0 0;
          color: #666;
        }

        .admin-contact {
          margin-top: 10px;
          padding: 8px 12px;
          background: #e8f5e8;
          border-radius: 8px;
          border-left: 4px solid #2c7a2c;
        }

        .admin-contact span {
          color: #666;
          font-size: 0.9rem;
        }

        .admin-phone {
          color: #2c7a2c;
          font-weight: bold;
          text-decoration: none;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .admin-phone:hover {
          color: #236623;
          text-decoration: underline;
        }

        .no-tickets {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .no-tickets h3 {
          margin-bottom: 10px;
          color: #333;
        }

        .tickets-list {
          display: grid;
          gap: 20px;
        }

        .ticket-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ticket-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .ticket-header h4 {
          margin: 0;
          color: #333;
          flex: 1;
        }

        .ticket-meta {
          display: flex;
          gap: 8px;
        }

        .status, .priority, .category {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .ticket-preview {
          color: #666;
          margin: 10px 0;
          line-height: 1.4;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .support-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .ticket-details {
          padding: 20px;
        }

        .ticket-details .ticket-header {
          margin-bottom: 20px;
        }

        .ticket-content {
          margin-bottom: 20px;
        }

        .ticket-message,
        .ticket-response {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .ticket-response {
          background: #e8f5e8;
        }

        .responded-by {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 12px;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .loading, .error {
          text-align: center;
          padding: 60px 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SupportDashboard;
