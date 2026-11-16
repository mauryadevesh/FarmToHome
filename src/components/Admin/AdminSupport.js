import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaCheckCircle, FaExclamationTriangle, FaReply } from 'react-icons/fa';
import { PageTransition } from '../UI/Motion';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSupport();
      setTickets(Array.isArray(res) ? res : []);
    } catch (err) {
      setError('Failed to fetch support tickets');
      console.error('Fetch support tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    const activeId = selectedTicket?._id || selectedTicket?.id;
    if (!activeId || !response.trim()) {
      setError('Please provide a response message.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.respondToSupport(activeId, response.trim());
      setSuccess('Response sent successfully! Ticket marked as resolved.');
      setResponse('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      setError('Failed to send response');
      console.error('Respond to support error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  });

  const countByStatus = (st) => tickets.filter(t => t.status === st).length;

  if (loading) {
    return (
      <PageTransition className="admin-page">
        <div className="admin-support-management">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading support tickets...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="admin-page">
      <div className="admin-support-management">
        <div className="page-header">
          <h1>Customer & Farmer Support Desk</h1>
          <p>Review incoming inquiries from Mira Bhayandar, troubleshoot delivery queries, and send direct responses.</p>
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

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'open' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('open')}
          >
            Open Inquiries ({countByStatus('open')})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'resolved' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('resolved')}
          >
            Resolved ({countByStatus('resolved')})
          </button>
        </div>

        <div className="support-container">
          <div className="tickets-list">
            <div className="tickets-grid">
              {filteredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted)' }}>
                  No support tickets found in this view.
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const ticketKey = ticket._id || ticket.id;
                  const isSelected = selectedTicket && (selectedTicket._id || selectedTicket.id) === ticketKey;
                  const displayId = (ticketKey || 'TCK').toString().slice(-8);
                  const ticketDate = ticket.createdAt || ticket.created_at;

                  return (
                    <div
                      key={ticketKey}
                      className={`ticket-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setResponse('');
                      }}
                    >
                      <div className="ticket-header">
                        <span className="ticket-id">#{displayId}</span>
                        <span className={`priority-badge priority-badge--${ticket.priority}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="ticket-subject">{ticket.subject}</div>
                      <div className="ticket-meta">
                        <div className="customer-name">{ticket.user?.name || 'User'}</div>
                        <div className="ticket-date">{formatDate(ticketDate)}</div>
                      </div>
                      <span className={`status-badge status-badge--${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedTicket && (
            <div className="ticket-details">
              <h3>Ticket Details</h3>
              <div className="ticket-info">
                <div className="info-row">
                  <label>Ticket ID:</label>
                  <span>#{(selectedTicket._id || selectedTicket.id || 'TCK').toString().slice(-8)}</span>
                </div>
                <div className="info-row">
                  <label>Customer:</label>
                  <span>{selectedTicket.user?.name || 'User'} ({selectedTicket.user?.email || 'N/A'})</span>
                </div>
                <div className="info-row">
                  <label>Subject:</label>
                  <span>{selectedTicket.subject}</span>
                </div>
                <div className="info-row">
                  <label>Priority:</label>
                  <span className={`priority-badge priority-badge--${selectedTicket.priority}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="info-row">
                  <label>Status:</label>
                  <span className={`status-badge status-badge--${selectedTicket.status}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="info-row">
                  <label>Date Submitted:</label>
                  <span>{formatDate(selectedTicket.createdAt || selectedTicket.created_at)}</span>
                </div>
              </div>

              <div className="message-section">
                <h4>Customer Inquiry:</h4>
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
                <h4>Send Response to Customer:</h4>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your official administrative response here..."
                  className="response-textarea"
                  rows="4"
                />
                <div className="response-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleRespond}
                    className="btn btn-primary"
                    disabled={!response.trim() || submitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaReply /> {submitting ? 'Sending...' : 'Send Response'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicket(null);
                      setResponse('');
                    }}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminSupport;
