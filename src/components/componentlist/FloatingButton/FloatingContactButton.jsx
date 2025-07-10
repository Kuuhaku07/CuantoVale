import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCommentDots } from 'react-icons/fa';
import './FloatingContactButton.css';

/**
 * FloatingContactButton component
 * Props:
 * - contacts: array of contact objects with:
 *    - icon: React node or image element
 *    - color: string (CSS color)
 *    - link: string (URL or identifier)
 *    - action: 'link' or 'copy' (click behavior)
 * - mainIcon: React node for the main button icon (default FaCommentDots)
 * - mainText: optional string to display below the main button
 * - onCopy: optional function to handle copy success notification
 */
const FloatingContactButton = ({ contacts, mainIcon, mainText, onCopy }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleContactClick = (contact) => {
    if (contact.action === 'copy') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(contact.link).then(() => {
          if (onCopy && typeof onCopy === 'function') {
            onCopy('Información copiada al portapapeles');
          } else {
            alert('Información copiada al portapapeles');
          }
        });
      } else {
        if (onCopy && typeof onCopy === 'function') {
          onCopy('Tu navegador no soporta copiar al portapapeles');
        } else {
          alert('Tu navegador no soporta copiar al portapapeles');
        }
      }
    } else if (contact.action === 'link') {
      window.open(contact.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="floating-contact-button-container">
      {expanded && (
        <div className="floating-contact-options">
          {contacts.map((contact, index) => (
            <button
              key={index}
              className="floating-contact-option"
              style={{ backgroundColor: contact.color }}
              onClick={() => handleContactClick(contact)}
              title={contact.link}
              type="button"
            >
              <div className="floating-contact-icon-wrapper">{contact.icon}</div>
            </button>
          ))}
        </div>
      )}
      <div className="floating-contact-main-wrapper">
        <button
          className="floating-contact-main-button"
          onClick={toggleExpanded}
          type="button"
          aria-label={expanded ? 'Cerrar contactos' : 'Abrir contactos'}
        >
          <div className="floating-contact-icon-wrapper">
            {mainIcon || <FaCommentDots color="var(--color-white)" size="1.6em" />}
          </div>
        </button>
        {mainText && <div className="floating-contact-main-text">{mainText}</div>}
      </div>
    </div>
  );
};

FloatingContactButton.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      color: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      action: PropTypes.oneOf(['link', 'copy']).isRequired,
    })
  ).isRequired,
  mainIcon: PropTypes.node,
  mainText: PropTypes.string,
  onCopy: PropTypes.func,
};

FloatingContactButton.defaultProps = {
  mainIcon: null,
  mainText: null,
  onCopy: null,
};

export default FloatingContactButton;
