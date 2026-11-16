import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { FaPhoneAlt } from 'react-icons/fa';
import { PageTransition, motion, AnimatePresence } from '../UI/Motion';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'other',
    priority: 'medium'
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleTicketClick = async (ticketId) => {
    try {
      const ticket = await apiService.getSupportTicket(ticketId);
      setSelectedTicket(ticket);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details');
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
    <PageTransition className="support-dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Customer Support</h1>
          <p>Get help with your orders, products, and account</p>
          <div className="admin-contact">
            <span>Need immediate help? Call Admin: </span>
            <a href="tel:7671014068" className="admin-phone">
              <FaPhoneAlt style={{ marginRight: '6px', fontSize: '0.85em' }} />
              7671014068
            </a>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Create New Ticket
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              data-lenis-prevent
            >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {selectedTicket && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-lenis-prevent
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            data-lenis-prevent
          >
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
                  <span className={`badge-status badge-status--${selectedTicket.status}`}>
                    {selectedTicket.status}
                  </span>
                  <span className={`badge-priority badge-priority--${selectedTicket.priority}`}>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

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
            {tickets.map(ticket => {
              const ticketId = ticket._id || ticket.id;
              return (
                <div key={ticketId} className="ticket-card" onClick={() => handleTicketClick(ticketId)}>
                  <div className="ticket-header">
                    <h4>{ticket.subject}</h4>
                    <div className="ticket-meta">
                      <span className={`badge-status badge-status--${ticket.status}`}>
                        {ticket.status}
                      </span>
                      <span className={`badge-priority badge-priority--${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <p className="ticket-preview">{(ticket.message || '').substring(0, 100)}...</p>
                  <div className="ticket-footer">
                    <span className="category">{ticket.category}</span>
                    <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default SupportDashboard;
