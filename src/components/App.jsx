import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainCanvas from './MainCanvas';
import Omnibox from './Omnibox';
import NotesPanel from './NotesPanel';
import './App.css';

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [omniboxVisible, setOmniboxVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load projects
      const projectList = await window.electronAPI.database.getProjects();
      setProjects(projectList);
      
      if (projectList.length > 0) {
        setCurrentProject(projectList[0]);
      } else {
        // Create default project
        const result = await window.electronAPI.database.createProject(
          'My Research Project', 
          'Default project for getting started with ScholarLens'
        );
        const newProjects = await window.electronAPI.database.getProjects();
        setProjects(newProjects);
        setCurrentProject(newProjects[0]);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const showOmnibox = () => {
    setOmniboxVisible(true);
  };

  const hideOmnibox = () => {
    setOmniboxVisible(false);
  };

  const updateTab = (tabId, updates) => {
    const updatedTabs = tabs.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    );
    setTabs(updatedTabs);
    
    // Update active tab if it's the one being updated
    if (activeTab && activeTab.id === tabId) {
      setActiveTab({ ...activeTab, ...updates });
    }

    // Add to history when URL changes
    if (updates.url && updates.title) {
      window.electronAPI.database.addToHistory(updates.url, updates.title);
    }
  };

  const createNewTab = (url, title = 'New Tab') => {
    console.log('createNewTab called with:', { url, title });
    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      url,
      title,
      isActive: true,
      isLoading: false,
      createdAt: Date.now()
    };
    
    // Deactivate other tabs
    const updatedTabs = tabs.map(tab => ({ ...tab, isActive: false }));
    updatedTabs.push(newTab);
    
    setTabs(updatedTabs);
    setActiveTab(newTab);
    
    console.log('Created new tab:', newTab);
  };

  const switchTab = (tabId) => {
    console.log('Switching to tab:', tabId);
    
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    setTabs(updatedTabs);
    
    const newActiveTab = updatedTabs.find(tab => tab.id === tabId);
    setActiveTab(newActiveTab);
    
    console.log('Active tab set to:', newActiveTab);
  };

  const closeTab = (tabId) => {
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    if (activeTab && activeTab.id === tabId) {
      const newActiveTab = updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1] : null;
      setActiveTab(newActiveTab);
    }
  };

  const handleNavigateToUrl = (url) => {
    console.log('handleNavigateToUrl called with:', url);
    // Create a new tab or navigate existing tab to the URL
    createNewTab(url);
    setShowNotesPanel(false); // Close notes panel after navigation
    console.log('Navigation completed, notes panel closed');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Cmd/Ctrl + L to show omnibox
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault();
        showOmnibox();
      }
      
      // Cmd/Ctrl + B to toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
      
      // Escape to hide omnibox
      if (event.key === 'Escape' && omniboxVisible) {
        hideOmnibox();
      }
      
      // Cmd/Ctrl + Shift + N to show notes panel
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        setShowNotesPanel(!showNotesPanel);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [omniboxVisible]);

  return (
    <div className="scholar-lens-app">
      <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          currentProject={currentProject}
          projects={projects}
          tabs={tabs}
          activeTab={activeTab}
          onTabSwitch={switchTab}
          onTabClose={closeTab}
          onNewTab={createNewTab}
          onShowNotes={() => setShowNotesPanel(true)}
        />
        
        <MainCanvas
          activeTab={activeTab}
          onShowOmnibox={showOmnibox}
          sidebarCollapsed={sidebarCollapsed}
          onTabUpdate={updateTab}
          currentProject={currentProject}
        />
        
        {omniboxVisible && (
          <Omnibox
            onHide={hideOmnibox}
            onNavigate={createNewTab}
          />
        )}
        
        <NotesPanel
          currentProject={currentProject}
          activeTab={activeTab}
          isVisible={showNotesPanel}
          onClose={() => setShowNotesPanel(false)}
          onNavigateToUrl={handleNavigateToUrl}
        />
      </div>
    </div>
  );
};

export default App;