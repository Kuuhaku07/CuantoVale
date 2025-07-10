import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import ToastMessage from './ToastMessage';
import './ToastMessage.css';

/**
 * ToastContainer component to manage and display multiple toast messages stacked.
 * 
 * Usage:
 * - Use addToast(message, type, duration) to add a new toast.
 * 
 * This component manages an array of toasts and renders them stacked.
 */
const ToastContainer = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  // Add a new toast
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + '-' + toastIdCounter.current++;
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  };

  // Remove a toast by id
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Effect to auto-remove toasts after their duration
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    });
  }, [toasts]);

  // Expose addToast method to parent via ref
  useImperativeHandle(ref, () => ({
    addToast,
  }));

  return (
    <div className="toast-container" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
      {toasts.map(({ id, message, type, duration }) => (
        <ToastMessage
          key={id}
          message={message}
          type={type}
          duration={duration}
          onClose={() => removeToast(id)}
        />
      ))}
    </div>
  );
});

export default ToastContainer;
