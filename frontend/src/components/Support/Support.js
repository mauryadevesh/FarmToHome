import React from 'react';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaClock, FaSeedling, FaQuestionCircle } from 'react-icons/fa';

const supportOptions = [
  {
    title: 'Consumer Support & Orders',
    description: 'Get immediate help with produce quality, delivery schedule, or payment status.',
    email: 'support@farmtohome.com',
    phone: '+91 76710 14068',
    hours: 'Monday – Saturday, 8:00 AM – 8:00 PM'
  },
  {
    title: 'Farmer Onboarding & Payouts',
    description: 'Assistance for village farmers with listing crops, stock adjustments, and bank payouts.',
    email: 'farmers@farmtohome.com',
    phone: '+91 91234 56780',
    hours: 'Monday – Saturday, 7:00 AM – 6:00 PM'
  },
  {
    title: 'WhatsApp Direct Chat',
    description: 'Direct messaging with our Bangalore operations coordinator for immediate questions.',
    email: 'help@farmtohome.com',
    phone: '+91 76710 14068',
    hours: '7 Days a Week, 7:00 AM – 9:00 PM'
  }
];

const Support = () => {
  return (
    <div className="support-container">
      <div className="support-header">
        <span className="support-badge">
          <FaQuestionCircle style={{ marginRight: '6px' }} />
          Human Support Desk
        </span>
        <h1>We Are Here to Help You</h1>
        <p>
          Whether you are a family buying fresh kitchen vegetables or a farmer selling your harvest,
          real people are standing by to assist you.
        </p>
      </div>

      <div className="support-grid">
        {supportOptions.map(option => (
          <div className="support-card" key={option.title}>
            <h2>{option.title}</h2>
            <p className="support-desc">{option.description}</p>
            <div className="support-meta">
              <div className="meta-item">
                <span className="support-label"><FaEnvelope /> Email</span>
                <a href={`mailto:${option.email}`} className="support-value-link">{option.email}</a>
              </div>
              <div className="meta-item">
                <span className="support-label"><FaPhoneAlt /> Phone / WhatsApp</span>
                <a href={`tel:${option.phone.replace(/[^\d+]/g, '')}`} className="support-value-link">{option.phone}</a>
              </div>
              <div className="meta-item">
                <span className="support-label"><FaClock /> Active Hours</span>
                <p className="support-value-text">{option.hours}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="support-cta">
        <h2>Need Immediate Assistance?</h2>
        <p>Call our direct customer hotline at <strong>+91 76710 14068</strong> or email us at <strong>help@farmtohome.com</strong>.</p>
        <div className="support-cta-buttons">
          <a href="tel:7671014068" className="btn btn-primary btn-large">
            <FaPhoneAlt style={{ marginRight: '8px' }} />
            Call Support Now
          </a>
          <a
            href="https://wa.me/917671014068?text=Hello%20FarmToHome%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-large"
          >
            <FaWhatsapp style={{ marginRight: '8px', color: '#25d366' }} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;
