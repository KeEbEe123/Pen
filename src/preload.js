// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    createProject: (name, description) => ipcRenderer.invoke('db:create-project', name, description),
    getProjects: () => ipcRenderer.invoke('db:get-projects'),
    getProject: (id) => ipcRenderer.invoke('db:get-project', id),
    createBookmark: (projectId, url, title, content, snapshotHtml) => 
      ipcRenderer.invoke('db:create-bookmark', projectId, url, title, content, snapshotHtml),
    getBookmarks: (projectId) => ipcRenderer.invoke('db:get-bookmarks', projectId),
    createNote: (projectId, bookmarkId, content, highlightText, highlightPosition, tags, highlightAnchor, url, pageTitle) =>
      ipcRenderer.invoke('db:create-note', projectId, bookmarkId, content, highlightText, highlightPosition, tags, highlightAnchor, url, pageTitle),
    getNotes: (projectId, bookmarkId) => ipcRenderer.invoke('db:get-notes', projectId, bookmarkId),
    getNotesByUrl: (projectId, url) => ipcRenderer.invoke('db:get-notes-by-url', projectId, url),
    clearAllNotes: (projectId) => ipcRenderer.invoke('db:clear-all-notes', projectId),
    
    // Citations
    createCitation: (projectId, bookmarkId, citationText, format, metadata) =>
      ipcRenderer.invoke('db:create-citation', projectId, bookmarkId, citationText, format, metadata),
    getCitations: (projectId) => ipcRenderer.invoke('db:get-citations', projectId),
    updateCitation: (id, citationText, format, metadata) =>
      ipcRenderer.invoke('db:update-citation', id, citationText, format, metadata),
    deleteCitation: (id) => ipcRenderer.invoke('db:delete-citation', id),
    setSetting: (key, value) => ipcRenderer.invoke('db:set-setting', key, value),
    getSetting: (key) => ipcRenderer.invoke('db:get-setting', key),
    
    // History operations
    addToHistory: (url, title) => ipcRenderer.invoke('db:add-to-history', url, title),
    getHistory: (limit) => ipcRenderer.invoke('db:get-history', limit),
    searchHistory: (query, limit) => ipcRenderer.invoke('db:search-history', query, limit)
  },

  // Gemini AI operations
  gemini: {
    initialize: (apiKey) => ipcRenderer.invoke('gemini:initialize', apiKey),
    detectClaims: (text) => ipcRenderer.invoke('gemini:detect-claims', text),
    generateCitation: (url, title, author, publishDate, format) =>
      ipcRenderer.invoke('gemini:generate-citation', url, title, author, publishDate, format),
    improveWriting: (text, context) => ipcRenderer.invoke('gemini:improve-writing', text, context),
    summarizeContent: (text, maxLength) => ipcRenderer.invoke('gemini:summarize-content', text, maxLength),
    isInitialized: () => ipcRenderer.invoke('gemini:is-initialized')
  },

  // WebView operations
  webview: {
    capturePage: (tabId) => ipcRenderer.invoke('webview:capture-page', tabId),
    extractText: (tabId) => ipcRenderer.invoke('webview:extract-text', tabId),
    injectScript: (tabId, script) => ipcRenderer.invoke('webview:inject-script', tabId, script),
    textSelected: (data) => ipcRenderer.invoke('webview:text-selected', data)
  }
});
