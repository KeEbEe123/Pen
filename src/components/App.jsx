import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainCanvas from './MainCanvas';
import Omnibox from './Omnibox';
import './App.css';

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [omniboxVisible, setOmniboxVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState([]);

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

  const createNewTab = (url, title = 'New Tab') => {
    const newTab = {
      id: Date.now(),
      url,
      title,
      isActive: true
    };
    
    // Deactivate other tabs
    const updatedTabs = tabs.map(tab => ({ ...tab, isActive: false }));
    updatedTabs.push(newTab);
    
    setTabs(updatedTabs);
    setActiveTab(newTab);
  };

  const switchTab = (tabId) => {
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    setTabs(updatedTabs);
    setActiveTab(updatedTabs.find(tab => tab.id === tabId));
  };

  const closeTab = (tabId) => {
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    if (activeTab && activeTab.id === tabId) {
      const newActiveTab = updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1] : null;
      setActiveTab(newActiveTab);
    }
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
        />
        
        <MainCanvas
          activeTab={activeTab}
          onShowOmnibox={showOmnibox}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {omniboxVisible && (
          <Omnibox
            onHide={hideOmnibox}
            onNavigate={createNewTab}
          />
        )}
      </div>
    </div>
  );
};

export default App;