import React, { useState, useEffect, useRef } from 'react';
import './AnnotationOverlay.css';

const AnnotationOverlay = ({ 
  isVisible, 
  position, 
  selectedText, 
  onCreateNote, 
  onHighlight, 
  onClose 
}) => {
  const overlayRef = useRef(null);
  const [noteText, setNoteText] = useState('');
  const [tags, setTags] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    if (isVisible && overlayRef.current) {
      // Position the overlay near the cursor/selection
      const overlay = overlayRef.current;
      const rect = overlay.getBoundingClientRect();
      
      // Calculate position with boundary checks
      let left = position.x;
      let top = position.y;
      
      // Ensure overlay stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if it would overflow
      if (left + rect.width > viewportWidth - 20) {
        left = viewportWidth - rect.width - 20;
      }
      if (left < 20) {
        left = 20;
      }
      
      // Adjust vertical position if it would overflow
      if (top + rect.height > viewportHeight - 20) {
        top = position.y - rect.height - 20; // Position above instead
      }
      if (top < 20) {
        top = 20;
      }
      
      overlay.style.left = `${left}px`;
      overlay.style.top = `${top}px`;
    }
  }, [isVisible, position]);

  const handleHighlight = () => {
    onHighlight(selectedText);
    onClose();
  };

  const handleCreateNote = () => {
    setIsCreatingNote(true);
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      onCreateNote(selectedText, noteText.trim(), tags.trim());
      setNoteText('');
      setTags('');
      setIsCreatingNote(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setNoteText('');
    setTags('');
    setIsCreatingNote(false);
    if (!isCreatingNote) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="annotation-overlay" ref={overlayRef}>
      <div className="annotation-popup">
        {!isCreatingNote ? (
          <div className="annotation-actions">
            <div className="selected-text-preview">
              "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
            </div>
            
            <div className="action-buttons">
              <button 
                className="action-btn highlight-btn"
                onClick={handleHighlight}
                title="Highlight text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11H1v3h8v3l3-4-3-4v2zM22 12l-4-4v2h-8v4h8v2l4-4z"/>
                </svg>
                Highlight
              </button>
              
              <button 
                className="action-btn note-btn"
                onClick={handleCreateNote}
                title="Create note"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Note
              </button>
              
              <button 
                className="action-btn close-btn"
                onClick={handleCancel}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="note-creation">
            <div className="note-header">
              <h4>Create Note</h4>
              <div className="selected-text-context">
                "{selectedText.substring(0, 80)}{selectedText.length > 80 ? '...' : ''}"
              </div>
            </div>
            
            <textarea
              className="note-input"
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
              rows={4}
            />
            
            <input
              type="text"
              className="tags-input"
              placeholder="Tags (comma-separated, e.g. important, research, todo)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            
            <div className="note-actions">
              <button 
                className="action-btn save-btn"
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
              >
                Save Note
              </button>
              <button 
                className="action-btn cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationOverlay;