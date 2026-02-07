import React, { useState, useEffect } from 'react';
import WebView from './WebView';
import './MainCanvas.css';

const MainCanvas = ({ activeTab, onShowOmnibox, sidebarCollapsed, onTabUpdate, currentProject }) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [renderedTabs, setRenderedTabs] = useState(new Map());

  useEffect(() => {
    if (activeTab) {
      setIsSwitching(true);
      const timer = setTimeout(() => setIsSwitching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab?.id]);

  const handleCanvasClick = () => {
    // Show omnibox when clicking on empty canvas
    if (!activeTab) {
      onShowOmnibox();
    }
  };

  const handleWebViewNavigate = (url) => {
    if (activeTab && onTabUpdate) {
      onTabUpdate(activeTab.id, { url });
    }
  };

  const handleWebViewTitleChange = (title) => {
    if (activeTab && onTabUpdate) {
      onTabUpdate(activeTab.id, { title });
    }
  };

  const handleWebViewLoadingChange = (isLoading) => {
    if (activeTab && onTabUpdate) {
      onTabUpdate(activeTab.id, { isLoading });
    }
  };

  const handleWebViewCreateNote = async (text, noteContent, url, title, anchor, tags) => {
    console.log('handleWebViewCreateNote called:', { text, noteContent, url, title, anchor, tags });
    if (activeTab && onTabUpdate && currentProject) {
      try {
        // Create bookmark for this page if it doesn't exist
        const bookmark = await window.electronAPI.database.createBookmark(
          currentProject.id,
          url,
          title || 'Untitled',
          '', // content
          '' // snapshot HTML
        );
        
        console.log('Bookmark created:', bookmark);
        
        // Create note linked to the bookmark with URL and title
        const noteResult = await window.electronAPI.database.createNote(
          currentProject.id,
          bookmark.lastInsertRowid,
          noteContent,
          text, // highlight text
          '', // highlight position
          tags || '', // tags
          JSON.stringify(anchor), // highlight anchor
          url, // url
          title || 'Untitled' // page title
        );
        
        console.log('Note created successfully:', noteResult);
      } catch (error) {
        console.error('Error creating note:', error);
      }
    }
  };

  const handleWebViewHighlight = async (text, url, title, anchor) => {
    console.log('handleWebViewHighlight called:', { text, url, title, anchor });
    if (activeTab && onTabUpdate && currentProject) {
      try {
        // Create bookmark for this page if it doesn't exist
        const bookmark = await window.electronAPI.database.createBookmark(
          currentProject.id,
          url,
          title || 'Untitled',
          '', // content
          '' // snapshot HTML
        );
        
        console.log('Bookmark created for highlight:', bookmark);
        
        // Create highlight-only note with URL and title
        const noteResult = await window.electronAPI.database.createNote(
          currentProject.id,
          bookmark.lastInsertRowid,
          `Highlighted: "${text}"`,
          text, // highlight text
          '', // highlight position
          'highlight', // tags
          JSON.stringify(anchor), // highlight anchor
          url, // url
          title || 'Untitled' // page title
        );
        
        console.log('Highlight saved successfully:', noteResult);
      } catch (error) {
        console.error('Error saving highlight:', error);
      }
    }
  };

  return (
    <div className="main-canvas">
      <div className={`canvas-container ${isSwitching ? 'switching' : 'active'}`}>
        {activeTab ? (
          <WebView 
            key={activeTab.id} // Force re-render when tab changes
            url={activeTab.url}
            title={activeTab.title}
            tabId={activeTab.id}
            currentProject={currentProject}
            onNavigate={handleWebViewNavigate}
            onTitleChange={handleWebViewTitleChange}
            onLoadingChange={handleWebViewLoadingChange}
            onCreateNote={handleWebViewCreateNote}
            onHighlight={handleWebViewHighlight}
          />
        ) : (
          <div className="empty-canvas" onClick={handleCanvasClick}>
            <div className="welcome-content">
              <div className="welcome-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h2>Welcome to ScholarLens</h2>
              <p>Your AI-powered research companion</p>
              
              <div className="quick-actions">
                <button className="action-btn primary" onClick={onShowOmnibox}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  Start Browsing
                </button>
                
                <div className="keyboard-hint">
                  <span>Press <kbd>⌘L</kbd> or <kbd>Ctrl+L</kbd> to open address bar</span>
                </div>
              </div>
              
              <div className="features-preview">
                <div className="feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <div>
                    <h4>Smart Notes</h4>
                    <p>Capture and organize research insights</p>
                  </div>
                </div>
                
                <div className="feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 11H1v3h8v3l3-4-3-4v2zM22 12l-4-4v2h-8v4h8v2l4-4z"/>
                  </svg>
                  <div>
                    <h4>AI-Powered Analysis</h4>
                    <p>Detect claims and verify sources</p>
                  </div>
                </div>
                
                <div className="feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <div>
                    <h4>Citation Management</h4>
                    <p>Generate citations automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCanvas;