import React, { useState, useEffect } from 'react';
import './NotesPanel.css';

const NotesPanel = ({ 
  currentProject, 
  activeTab, 
  isVisible, 
  onClose,
  onNavigateToUrl // Add navigation handler
}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, current-page, highlights
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (isVisible && currentProject) {
      loadNotes();
    }
  }, [isVisible, currentProject, activeTab]);

  // Add interval to refresh notes when panel is visible
  useEffect(() => {
    let interval;
    if (isVisible && currentProject) {
      interval = setInterval(() => {
        loadNotes();
      }, 2000); // Refresh every 2 seconds when panel is open
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisible, currentProject]);

  const loadNotes = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const allNotes = await window.electronAPI.database.getNotes(currentProject.id);
      setNotes(allNotes);
      
      // Extract unique tags
      const tags = new Set();
      allNotes.forEach(note => {
        if (note.tags) {
          note.tags.split(',').forEach(tag => tags.add(tag.trim()));
        }
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    // Filter by page
    if (filter === 'current-page' && activeTab) {
      // Filter notes for current page (would need bookmark_id matching)
      return true; // Simplified for now
    }
    if (filter === 'highlights') {
      if (!note.highlight_text || note.highlight_text.trim().length === 0) {
        return false;
      }
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      if (!note.tags) return false;
      const noteTags = note.tags.split(',').map(t => t.trim());
      return selectedTags.some(tag => noteTags.includes(tag));
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNoteClick = (note) => {
    console.log('Note clicked:', note);
    console.log('onNavigateToUrl prop:', onNavigateToUrl);
    console.log('Note URL:', note.url);
    
    if (note.url && note.url.trim() !== '' && onNavigateToUrl) {
      console.log('Navigating to URL:', note.url);
      onNavigateToUrl(note.url);
    } else {
      console.log('Cannot navigate - missing URL or handler:', {
        hasUrl: !!note.url,
        urlValue: note.url,
        hasHandler: !!onNavigateToUrl
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        // Would implement delete functionality
        console.log('Delete note:', noteId);
        loadNotes(); // Reload notes
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL notes and highlights? This cannot be undone.')) {
      try {
        await window.electronAPI.database.clearAllNotes(currentProject.id);
        loadNotes();
      } catch (error) {
        console.error('Error clearing notes:', error);
      }
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!isVisible) return null;

  return (
    <div className="notes-panel">
      <div className="notes-panel-header">
        <h3>Research Notes</h3>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={loadNotes}
            title="Refresh notes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </button>
          <button className="close-panel-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="notes-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Notes ({notes.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'current-page' ? 'active' : ''}`}
          onClick={() => setFilter('current-page')}
        >
          This Page
        </button>
        <button 
          className={`filter-btn ${filter === 'highlights' ? 'active' : ''}`}
          onClick={() => setFilter('highlights')}
        >
          Highlights
        </button>
        <button 
          className="filter-btn clear-btn"
          onClick={handleClearAll}
          title="Clear all notes and highlights"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
          </svg>
          Clear All
        </button>
      </div>

      {allTags.length > 0 && (
        <div className="notes-tags-filter">
          <span className="tags-label">Filter by tags:</span>
          <div className="tags-list">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="notes-content">
        {loading ? (
          <div className="notes-loading">
            <div className="loading-spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <h4>No notes yet</h4>
            <p>Select text on any webpage to create your first note or highlight.</p>
          </div>
        ) : (
          <div className="notes-list">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${note.url ? 'clickable' : ''}`}
                onClick={() => handleNoteClick(note)}
              >
                {note.highlight_text && (
                  <div className="note-highlight">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 11H1v3h8v3l3-4-3-4v2zM22 12l-4-4v2h-8v4h8v2l4-4z"/>
                    </svg>
                    "{note.highlight_text}"
                  </div>
                )}
                
                <div className="note-content">
                  {note.content}
                </div>
                
                {note.url && (
                  <div className="note-source">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span className="note-url" title={note.url}>
                      {note.page_title || new URL(note.url).hostname}
                    </span>
                  </div>
                )}
                
                <div className="note-meta">
                  <span className="note-date">{formatDate(note.created_at)}</span>
                  {note.tags && (
                    <div className="note-tags">
                      {note.tags.split(',').map(tag => (
                        <span key={tag} className="note-tag">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  <button 
                    className="note-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    title="Delete note"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;