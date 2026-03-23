import React, { useState, useEffect } from 'react';
import WebView from './WebView';
import './MainCanvas.css';
import inkblotIcon from '../inkblot.svg';

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
              <div className="ink-logo">
                <img src={inkblotIcon} alt="Ink blot" className="inkblot-image" />
              </div>
              
              <h1 className="ink-title">Ink</h1>
              <p className="ink-subtitle">what are you working on today, keertan?</p>
              <p className="keyboard-shortcut">Press ⌘L or Ctrl+L to open a tab</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCanvas;