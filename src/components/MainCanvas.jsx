import React from 'react';
import WebView from './WebView';
import './MainCanvas.css';

const MainCanvas = ({ activeTab, onShowOmnibox, sidebarCollapsed }) => {
  const handleCanvasClick = () => {
    // Show omnibox when clicking on empty canvas
    if (!activeTab) {
      onShowOmnibox();
    }
  };

  return (
    <div className="main-canvas">
      <div className="canvas-container">
        {activeTab ? (
          <WebView 
            url={activeTab.url}
            title={activeTab.title}
            tabId={activeTab.id}
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