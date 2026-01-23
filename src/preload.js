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
    createNote: (projectId, bookmarkId, content, highlightText, highlightPosition, tags) =>
      ipcRenderer.invoke('db:create-note', projectId, bookmarkId, content, highlightText, highlightPosition, tags),
    getNotes: (projectId, bookmarkId) => ipcRenderer.invoke('db:get-notes', projectId, bookmarkId),
    setSetting: (key, value) => ipcRenderer.invoke('db:set-setting', key, value),
    getSetting: (key) => ipcRenderer.invoke('db:get-setting', key)
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
  }
});
