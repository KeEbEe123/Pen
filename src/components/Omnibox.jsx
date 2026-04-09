import React, { useState, useRef, useEffect } from 'react';
import './Omnibox.css';

const Omnibox = ({ onHide, onNavigate }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input when omnibox appears
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Generate suggestions based on input
    if (value.length > 0) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const generateSuggestions = (query) => {
    const suggestions = [];
    
    // Check if it looks like a URL
    if (isURL(query)) {
      suggestions.push({
        type: 'url',
        text: query,
        description: 'Go to URL'
      });
    } else {
      // Search suggestions
      suggestions.push({
        type: 'search',
        text: `Search for "${query}"`,
        description: 'Google Search',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
      });
      
      // Academic search suggestions
      suggestions.push({
        type: 'search',
        text: `Search "${query}" on Google Scholar`,
        description: 'Academic Search',
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`
      });
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const isURL = (text) => {
    // Already has a scheme — validate it parses
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(text)) {
      try {
        new URL(text);
        return true;
      } catch {
        return false;
      }
    }
    // No scheme — must look like a domain (e.g. "example.com", "docs.google.com/path")
    return /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate(input.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.url) {
      navigate(suggestion.url, suggestion.text);
    } else {
      navigate(suggestion.text);
    }
  };

  const navigate = (url, title) => {
    let finalUrl = url;
    let finalTitle = title || url;
    
    if (!url.startsWith('http')) {
      if (isURL(url)) {
        finalUrl = `https://${url}`;
      } else {
        // Treat as search query
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        finalTitle = `Search: ${url}`;
      }
    }
    
    onNavigate(finalUrl, finalTitle);
    onHide();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onHide();
    }
  };

  return (
    <div className="omnibox-overlay" onClick={onHide}>
      <div className="omnibox-container" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="omnibox-form">
          <div className="omnibox-input-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="omnibox-input"
              placeholder="Search or enter address"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {input && (
              <button
                type="button"
                className="clear-button"
                onClick={() => setInput('')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </form>
        
        {suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-icon">
                  {suggestion.type === 'url' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  )}
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-text">{suggestion.text}</div>
                  <div className="suggestion-description">{suggestion.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="omnibox-footer">
          <span className="keyboard-hint">Press <kbd>Enter</kbd> to navigate • <kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default Omnibox;