import React from 'react';
import './Alert.css';

const Alert = ({ type, message, onClose, autoClose = false }) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert--${type}`}>
      <span className="alert__message">{message}</span>
      {onClose && (
        <button className="alert__close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
