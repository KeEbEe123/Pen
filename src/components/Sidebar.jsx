import React, { useState } from 'react';
import ProjectManager from './ProjectManager';
import './Sidebar.css';

const Sidebar = ({ 
  collapsed, 
  onToggle, 
  currentProject, 
  projects, 
  tabs, 
  activeTab, 
  onTabSwitch, 
  onTabClose, 
  onNewTab,
  onShowNotes,
  onShowCitations,
  onProjectSwitch,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete
}) => {
  const [activeSection, setActiveSection] = useState('tabs');

  const handleTabClick = (tab) => {
    onTabSwitch(tab.id);
  };

  const handleTabClose = (e, tabId) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handleNewTab = () => {
    onNewTab('about:blank', 'New Tab');
  };

  const handleAddBookmark = async () => {
    if (activeTab && currentProject) {
      try {
        await window.electronAPI.database.createBookmark(
          currentProject.id,
          activeTab.url,
          activeTab.title || 'Untitled',
          '', // content - could be extracted later
          '' // snapshot HTML - could be captured later
        );
        console.log('Bookmark added successfully');
      } catch (error) {
        console.error('Error adding bookmark:', error);
      }
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        
        {!collapsed && (
          <div className="sidebar-title">
            <h2>INK</h2>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        <button 
          className={`nav-item ${activeSection === 'tabs' ? 'active' : ''}`}
          onClick={() => setActiveSection('tabs')}
          title="Tabs"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {!collapsed && <span>Tabs</span>}
        </button>

        <button 
          className={`nav-item ${activeSection === 'notes' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('notes');
            onShowNotes?.();
          }}
          title="Notes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          {!collapsed && <span>Notes</span>}
        </button>

        <button 
          className={`nav-item ${activeSection === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveSection('bookmarks')}
          title="Bookmarks"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          {!collapsed && <span>Bookmarks</span>}
        </button>

        <button 
          className={`nav-item ${activeSection === 'citations' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('citations');
            onShowCitations?.();
          }}
          title="Citations"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          {!collapsed && <span>Citations</span>}
        </button>

        <button 
          className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveSection('projects')}
          title="Projects"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          {!collapsed && <span>Projects</span>}
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">
        {!collapsed && (
          <>
            {activeSection === 'tabs' && (
              <div className="tabs-section">
                <div className="section-header">
                  <h3>Open Tabs</h3>
                  <button className="new-tab-btn" onClick={handleNewTab} title="New Tab">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                
                <div className="tabs-list">
                  {tabs.length === 0 ? (
                    <div className="empty-state">
                      <p>No tabs open</p>
                      <button onClick={handleNewTab} className="create-tab-btn">
                        Create New Tab
                      </button>
                    </div>
                  ) : (
                    tabs.map(tab => (
                      <div 
                        key={tab.id}
                        className={`tab-item ${tab.isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                      >
                        <div className="tab-favicon">
                          {tab.isLoading ? (
                            <div className="tab-loading-spinner"></div>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                          )}
                        </div>
                        <div className="tab-info">
                          <div className="tab-title">{tab.title}</div>
                          <div className="tab-url">{tab.url}</div>
                        </div>
                        <button 
                          className="tab-close"
                          onClick={(e) => handleTabClose(e, tab.id)}
                          title="Close tab"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="projects-section">
                <div className="section-header">
                  <h3>Projects</h3>
                </div>
                
                <ProjectManager
                  projects={projects}
                  currentProject={currentProject}
                  onProjectSwitch={onProjectSwitch}
                  onProjectCreate={onProjectCreate}
                  onProjectUpdate={onProjectUpdate}
                  onProjectDelete={onProjectDelete}
                />
              </div>
            )}

            {activeSection === 'notes' && (
              <div className="notes-section">
                <div className="section-header">
                  <h3>Notes</h3>
                </div>
                <div className="empty-state">
                  <p>Notes will appear here</p>
                </div>
              </div>
            )}

            {activeSection === 'bookmarks' && (
              <div className="bookmarks-section">
                <div className="section-header">
                  <h3>Bookmarks</h3>
                  <button 
                    className="new-bookmark-btn" 
                    onClick={handleAddBookmark}
                    title="Bookmark current page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                
                <div className="bookmarks-list">
                  {/* Bookmarks will be loaded from database */}
                  <div className="empty-state">
                    <p>No bookmarks yet</p>
                    <button onClick={handleAddBookmark} className="create-bookmark-btn">
                      Bookmark Current Page
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;