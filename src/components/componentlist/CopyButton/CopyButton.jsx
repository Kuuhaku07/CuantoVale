import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaRegCopy, FaCheck } from 'react-icons/fa';
import './CopyButton.css';

/**
 * CopyButton component
 * Props:
 * - textToCopy: string (required) - the text to copy to clipboard
 * - buttonColor: string (optional) - CSS color for the button background, default to var(--color-primary)
 * - onCopy: function (optional) - callback function called on successful copy with message string
 * - size: string (optional) - button size: 'small', 'medium', 'large' (default 'medium')
 * - showConfirmation: boolean (optional) - whether to show a temporary confirmation icon after copy (default true)
 * - ariaLabel: string (optional) - accessible label for the button (default 'Copy to clipboard')
 */
const CopyButton = ({
  textToCopy,
  buttonColor = 'var(--primary-color)',
  onCopy,
  size = 'medium',
  showConfirmation = true,
  ariaLabel = 'Copy to clipboard',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        if (onCopy && typeof onCopy === 'function') {
          onCopy('Texto copiado al portapapeles');
        }
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      if (onCopy && typeof onCopy === 'function') {
        onCopy('Tu navegador no soporta copiar al portapapeles');
      }
    }
  };

  const sizeClass = {
    small: 'copy-button-small',
    medium: 'copy-button-medium',
    large: 'copy-button-large',
  }[size] || 'copy-button-medium';

  return (
    <button
      type="button"
      className={`copy-button ${sizeClass} ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      style={{ backgroundColor: buttonColor }}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <FaRegCopy className="icon-copy" size="1em" />
      <FaCheck className="icon-check" size="1em" />
    </button>
  );
};

CopyButton.propTypes = {
  textToCopy: PropTypes.string.isRequired,
  buttonColor: PropTypes.string,
  onCopy: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showConfirmation: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

export default CopyButton;
