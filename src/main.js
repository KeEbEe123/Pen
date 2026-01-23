const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const ScholarLensDB = require('./database');
const GeminiService = require('./gemini-api');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Initialize services
const database = new ScholarLensDB();
const geminiService = new GeminiService();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      webviewTag: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  const dbInitialized = database.initialize();
  if (!dbInitialized) {
    console.error('Failed to initialize database. Some features may not work.');
  }

  // Initialize Gemini API (check for API key in settings)
  const apiKey = database.getSetting('gemini_api_key');
  if (apiKey) {
    geminiService.initialize(apiKey);
  } else {
    console.log('Gemini API key not found. AI features will be disabled until configured.');
  }

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Close database connection
  database.close();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for database operations
ipcMain.handle('db:create-project', async (event, name, description) => {
  try {
    return database.createProject(name, description);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
});

ipcMain.handle('db:get-projects', async () => {
  try {
    return database.getProjects();
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
});

ipcMain.handle('db:get-project', async (event, id) => {
  try {
    return database.getProject(id);
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
});

ipcMain.handle('db:create-bookmark', async (event, projectId, url, title, content, snapshotHtml) => {
  try {
    return database.createBookmark(projectId, url, title, content, snapshotHtml);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    throw error;
  }
});

ipcMain.handle('db:get-bookmarks', async (event, projectId) => {
  try {
    return database.getBookmarks(projectId);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    throw error;
  }
});

ipcMain.handle('db:create-note', async (event, projectId, bookmarkId, content, highlightText, highlightPosition, tags) => {
  try {
    return database.createNote(projectId, bookmarkId, content, highlightText, highlightPosition, tags);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
});

ipcMain.handle('db:get-notes', async (event, projectId, bookmarkId) => {
  try {
    return database.getNotes(projectId, bookmarkId);
  } catch (error) {
    console.error('Error getting notes:', error);
    throw error;
  }
});

ipcMain.handle('db:set-setting', async (event, key, value) => {
  try {
    return database.setSetting(key, value);
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
});

ipcMain.handle('db:get-setting', async (event, key) => {
  try {
    return database.getSetting(key);
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
});

// IPC handlers for Gemini API operations
ipcMain.handle('gemini:initialize', async (event, apiKey) => {
  try {
    const success = geminiService.initialize(apiKey);
    if (success) {
      // Save API key to database
      database.setSetting('gemini_api_key', apiKey);
    }
    return success;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    throw error;
  }
});

ipcMain.handle('gemini:detect-claims', async (event, text) => {
  try {
    return await geminiService.detectClaims(text);
  } catch (error) {
    console.error('Error detecting claims:', error);
    throw error;
  }
});

ipcMain.handle('gemini:generate-citation', async (event, url, title, author, publishDate, format) => {
  try {
    return await geminiService.generateCitation(url, title, author, publishDate, format);
  } catch (error) {
    console.error('Error generating citation:', error);
    throw error;
  }
});

ipcMain.handle('gemini:improve-writing', async (event, text, context) => {
  try {
    return await geminiService.improveWriting(text, context);
  } catch (error) {
    console.error('Error improving writing:', error);
    throw error;
  }
});

ipcMain.handle('gemini:summarize-content', async (event, text, maxLength) => {
  try {
    return await geminiService.summarizeContent(text, maxLength);
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw error;
  }
});

ipcMain.handle('gemini:is-initialized', async () => {
  return geminiService.isInitialized();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
