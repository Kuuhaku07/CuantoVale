import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ImageViewerModal.css';

const ImageViewerModal = ({ isOpen, onClose, imageSrc, altText, caption, onPrev, onNext }) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const dragOccurred = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (onPrev) onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (onNext) onNext();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext, zoomed]);

  const toggleZoom = () => {
    if (dragOccurred.current) {
      dragOccurred.current = false;
      return;
    }
    setZoomed((prev) => !prev);
    if (zoomed) {
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setZoomed(false);
      setPosition({ x: 0, y: 0 });
      dragOccurred.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseDown = (e) => {
    if (!zoomed) return;
    e.preventDefault();
    setDragging(true);
    dragOccurred.current = false;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    dragOccurred.current = true;
    const x = e.clientX - dragStart.current.x;
    const y = e.clientY - dragStart.current.y;
    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    if (!zoomed) return;
    setDragging(false);
  };

  return ReactDOM.createPortal(
    <div className="image-viewer-overlay" onClick={handleOverlayClick}>
      <button
        className="image-viewer-close"
        onClick={onClose}
        aria-label="Close image viewer"
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10000,
          background: 'transparent',
          border: 'none',
          fontSize: '2rem',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold',
          lineHeight: 1,
          padding: 0,
          userSelect: 'none',
        }}
      >
        &times;
      </button>
      <div className="image-viewer-content" style={{ position: 'relative' }}>
        <img
          src={imageSrc}
          alt={altText}
          className={`image-viewer-img ${zoomed ? 'zoomed' : ''}`}
          onClick={toggleZoom}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          ref={imgRef}
          style={{
            cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomed ? 2 : 1})`,
            transition: dragging ? 'none' : 'transform 0.3s ease',
          }}
          draggable={false}
        />
        {caption && (
          <div
            className="image-viewer-caption"
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              color: '#fff',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '6px 12px',
              borderRadius: '4px',
              maxWidth: '90vw',
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            {caption}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageViewerModal;
