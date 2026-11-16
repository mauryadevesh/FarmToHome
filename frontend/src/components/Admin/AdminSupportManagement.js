import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminSupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminSupport();
      setTickets(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch support tickets');
      console.error('Fetch support tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) {
      setError('Please provide a response');
      return;
    }

    try {
      await api.respondToSupport(selectedTicket._id, response);
      setSuccess('Response sent successfully!');
      setResponse('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      setError('Failed to send response');
      console.error('Respond to support error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#007bff',
      in_progress: '#ffc107',
      resolved: '#28a745',
      closed: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="admin-support-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support-management">
      <div className="section-header">
        <h2>Support Management</h2>
        <p>Handle queries from farmers and consumers</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>{success}</p>
        </div>
      )}

      <div className="support-container">
        <div className="tickets-list">
          <h3>Support Tickets</h3>
          <div className="tickets-grid">
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                className={`ticket-card ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setResponse('');
                }}
              >
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket._id.slice(-8)}</span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-meta">
                  <div className="customer-name">{ticket.user?.name}</div>
                  <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedTicket && (
          <div className="ticket-details">
            <h3>Ticket Details</h3>
            <div className="ticket-info">
              <div className="info-row">
                <label>Ticket ID:</label>
                <span>#{selectedTicket._id.slice(-8)}</span>
              </div>
              <div className="info-row">
                <label>Customer:</label>
                <span>{selectedTicket.user?.name} ({selectedTicket.user?.email})</span>
              </div>
              <div className="info-row">
                <label>Subject:</label>
                <span>{selectedTicket.subject}</span>
              </div>
              <div className="info-row">
                <label>Priority:</label>
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="info-row">
                <label>Status:</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedTicket.status) }}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <div className="info-row">
                <label>Created:</label>
                <span>{formatDate(selectedTicket.createdAt)}</span>
              </div>
            </div>

            <div className="message-section">
              <h4>Customer Message:</h4>
              <div className="message-content">
                {selectedTicket.message}
              </div>
            </div>

            {selectedTicket.response && (
              <div className="message-section">
                <h4>Previous Response:</h4>
                <div className="message-content response">
                  {selectedTicket.response}
                </div>
              </div>
            )}

            <div className="response-section">
              <h4>Your Response:</h4>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                className="response-textarea"
                rows="5"
              />
              <div className="response-actions">
                <button
                  onClick={handleRespond}
                  className="btn btn-primary"
                  disabled={!response.trim()}
                >
                  Send Response
                </button>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setResponse('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportManagement;
