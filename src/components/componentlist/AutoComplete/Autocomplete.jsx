import React, { useState, useEffect, useRef } from 'react';
import './Autocomplete.css';

const Autocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  fetchOptions, 
  placeholder = '', 
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceTimeout = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setOptions([]);
      setShowOptions(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await fetchOptions(inputValue);
        setOptions(results);
        setShowOptions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        setOptions([]);
        setShowOptions(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue, fetchOptions]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange && onChange(e.target.value);
  };

  const handleOptionClick = (option) => {
    setInputValue(option.label);
    setShowOptions(false);
    onSelect && onSelect(option);
  };

  const handleKeyDown = (e) => {
    if (!showOptions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleOptionClick(options[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowOptions(false);
    }
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="autocomplete-input"
      />
      {showOptions && options.length > 0 && (
        <ul className="autocomplete-options">
          {options.map((option, index) => (
            <li
              key={option.id ?? option.value ?? index}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={index === highlightedIndex ? 'highlighted' : ''}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
