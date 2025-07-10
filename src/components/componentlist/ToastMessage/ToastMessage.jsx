import React, { useState, useEffect } from 'react';
import './ToastMessage.css';


/**
 * Componente ToastMessage para mostrar mensajes emergentes.
 * Props:
 * - message: texto del mensaje a mostrar
 * - type: tipo de mensaje ('error', 'success', 'info'), afecta estilos
 * - duration: tiempo en ms que el mensaje se muestra antes de ocultarse (opcional, default 3000)
 */
const ToastMessage = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    setVisible(true); // Reset visible to true when message changes
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  // Calculate animation timings
  // fadein duration fixed at 0.5s
  // fadeout duration fixed at 0.5s
  // visible duration = duration - fadein - fadeout
  const fadeInDuration = 0.5; // seconds
  const fadeOutDuration = 0.5; // seconds
  const visibleDuration = (duration / 1000) - fadeInDuration - fadeOutDuration;
  const animationStyle = {
    animation: `fadein ${fadeInDuration}s, fadeout ${fadeOutDuration}s ${fadeInDuration + visibleDuration}s`
  };

  return (
    <div className={`toast-message toast-${type}`} style={animationStyle}>
      <span>{message}</span>
      <button className="toast-close" onClick={() => {
        setVisible(false);
        if (onClose) onClose();
      }}>&times;</button>
    </div>
  );
};

export default ToastMessage;
