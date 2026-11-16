import React, { useState, useRef } from 'react';
import { FaUpload, FaLink, FaTimes, FaImage, FaCheckCircle } from 'react-icons/fa';
import './ImageUpload.css';

/**
 * Compress an image file to a reasonable size (max dimension 1000px, JPEG 0.85)
 * to ensure fast uploads and responsive storage.
 */
const compressImageFile = (file, maxDim = 1000, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

const ImageUpload = ({ value, onChange, label = 'Product Photo', placeholder = 'https://example.com/product.jpg' }) => {
  const [tab, setTab] = useState(value && !value.startsWith('data:') ? 'url' : 'file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const compressedDataUrl = await compressImageFile(file);
      onChange(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      setError('Failed to process image. Please try a different photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-component">
      <div className="image-upload-header">
        <label className="image-upload-label">{label}</label>
        <div className="image-upload-tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'file' ? 'active' : ''}`}
            onClick={() => setTab('file')}
          >
            <FaUpload /> Upload File
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'url' ? 'active' : ''}`}
            onClick={() => setTab('url')}
          >
            <FaLink /> Image URL
          </button>
        </div>
      </div>

      {error && <div className="image-upload-error">{error}</div>}

      {tab === 'file' ? (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''} ${value ? 'has-image' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {isProcessing ? (
            <div className="dropzone-processing">
              <div className="spinner-sm" />
              <span>Optimizing photo...</span>
            </div>
          ) : value ? (
            <div className="dropzone-preview">
              <img src={value} alt="Uploaded produce preview" />
              <div className="preview-overlay" onClick={(e) => e.stopPropagation()}>
                <span className="preview-tag">
                  <FaCheckCircle /> Photo Loaded
                </span>
                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn-pill-action"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="btn-pill-action btn-pill-danger"
                    onClick={handleClear}
                  >
                    <FaTimes /> Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dropzone-idle">
              <div className="dropzone-icon">
                <FaImage />
              </div>
              <div className="dropzone-text">
                <strong>Click to choose a photo</strong> or drag & drop here
              </div>
              <span className="dropzone-hint">PNG, JPG, WebP up to 10MB • Auto-optimized for fast browsing</span>
            </div>
          )}
        </div>
      ) : (
        <div className="url-input-block">
          <div className="url-input-row">
            <input
              type="url"
              className="form-input url-field"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
            {value && (
              <button type="button" className="btn-clear-url" onClick={handleClear} title="Clear URL">
                <FaTimes />
              </button>
            )}
          </div>
          {value && (
            <div className="url-preview-card">
              <img
                src={value}
                alt="URL preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="url-preview-label">Live Link Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
