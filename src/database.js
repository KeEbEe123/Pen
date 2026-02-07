const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class ScholarLensDB {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  initialize() {
    try {
      // Get user data directory for storing the database
      const userDataPath = app.getPath('userData');
      this.dbPath = path.join(userDataPath, 'scholarlens.db');
      
      // Create database connection
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      // Create tables
      this.createTables();
      
      console.log('Database initialized successfully at:', this.dbPath);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  createTables() {
    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Run migrations to add new columns if they don't exist
    this.runMigrations();

    // Bookmarks/Pages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        url TEXT NOT NULL,
        title TEXT,
        content TEXT,
        snapshot_html TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Notes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        bookmark_id INTEGER,
        content TEXT NOT NULL,
        highlight_text TEXT,
        highlight_position TEXT,
        highlight_selector TEXT,
        tags TEXT,
        url TEXT,
        page_title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id) ON DELETE CASCADE
      )
    `);

    // Citations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS citations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        bookmark_id INTEGER,
        citation_text TEXT NOT NULL,
        format TEXT DEFAULT 'APA',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id) ON DELETE CASCADE
      )
    `);

    // Claims table (for AI-detected claims)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookmark_id INTEGER,
        claim_text TEXT NOT NULL,
        claim_type TEXT,
        confidence_score REAL,
        supporting_sources TEXT,
        verification_status TEXT DEFAULT 'unverified',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id) ON DELETE CASCADE
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // History table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        visit_count INTEGER DEFAULT 1
      )
    `);

    // Create index for faster history queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_history_url ON history(url);
      CREATE INDEX IF NOT EXISTS idx_history_time ON history(visit_time);
    `);
  }

  runMigrations() {
    // Check if columns exist and add them if they don't
    try {
      // Check if highlight_selector column exists
      const tableInfo = this.db.prepare("PRAGMA table_info(notes)").all();
      const columnNames = tableInfo.map(col => col.name);
      
      if (!columnNames.includes('highlight_selector')) {
        console.log('Adding highlight_selector column to notes table');
        this.db.exec('ALTER TABLE notes ADD COLUMN highlight_selector TEXT');
      }
      
      // New anchor-based column (preferred for robust restoration)
      if (!columnNames.includes('highlight_anchor')) {
        console.log('Adding highlight_anchor column to notes table');
        this.db.exec('ALTER TABLE notes ADD COLUMN highlight_anchor TEXT');
      }
      
      if (!columnNames.includes('url')) {
        console.log('Adding url column to notes table');
        this.db.exec('ALTER TABLE notes ADD COLUMN url TEXT');
      }
      
      if (!columnNames.includes('page_title')) {
        console.log('Adding page_title column to notes table');
        this.db.exec('ALTER TABLE notes ADD COLUMN page_title TEXT');
      }
      
      // Create index for faster URL lookups
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_notes_url ON notes(url)');
      
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
    }
  }

  // Project methods
  createProject(name, description = '') {
    const stmt = this.db.prepare(`
      INSERT INTO projects (name, description) 
      VALUES (?, ?)
    `);
    return stmt.run(name, description);
  }

  getProjects() {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
    return stmt.all();
  }

  getProject(id) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  }

  updateProject(id, name, description) {
    const stmt = this.db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(name, description, id);
  }

  deleteProject(id) {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  }

  // Bookmark methods
  createBookmark(projectId, url, title = '', content = '', snapshotHtml = '') {
    const stmt = this.db.prepare(`
      INSERT INTO bookmarks (project_id, url, title, content, snapshot_html) 
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(projectId, url, title, content, snapshotHtml);
  }

  getBookmarks(projectId) {
    const stmt = this.db.prepare('SELECT * FROM bookmarks WHERE project_id = ? ORDER BY created_at DESC');
    return stmt.all(projectId);
  }

  getBookmark(id) {
    const stmt = this.db.prepare('SELECT * FROM bookmarks WHERE id = ?');
    return stmt.get(id);
  }

  updateBookmark(id, title, content, snapshotHtml) {
    const stmt = this.db.prepare(`
      UPDATE bookmarks 
      SET title = ?, content = ?, snapshot_html = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(title, content, snapshotHtml, id);
  }

  deleteBookmark(id) {
    const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
    return stmt.run(id);
  }

  // Note methods
  createNote(projectId, bookmarkId, content, highlightText = '', highlightPosition = '', tags = '', highlightAnchor = '', url = '', pageTitle = '') {
    const stmt = this.db.prepare(`
      INSERT INTO notes (project_id, bookmark_id, content, highlight_text, highlight_position, tags, highlight_anchor, url, page_title) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(projectId, bookmarkId, content, highlightText, highlightPosition, tags, highlightAnchor, url, pageTitle);
  }

  getNotes(projectId, bookmarkId = null) {
    let stmt;
    if (bookmarkId) {
      stmt = this.db.prepare('SELECT * FROM notes WHERE project_id = ? AND bookmark_id = ? ORDER BY created_at DESC');
      return stmt.all(projectId, bookmarkId);
    } else {
      stmt = this.db.prepare('SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC');
      return stmt.all(projectId);
    }
  }

  getNotesByUrl(projectId, url) {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE project_id = ? AND url = ? ORDER BY created_at DESC');
    return stmt.all(projectId, url);
  }

  updateNote(id, content, tags) {
    const stmt = this.db.prepare(`
      UPDATE notes 
      SET content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(content, tags, id);
  }

  deleteNote(id) {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id);
  }

  clearAllNotes(projectId) {
    const stmt = this.db.prepare('DELETE FROM notes WHERE project_id = ?');
    return stmt.run(projectId);
  }

  // Citation methods
  createCitation(projectId, bookmarkId, citationText, format = 'APA', metadata = '') {
    const stmt = this.db.prepare(`
      INSERT INTO citations (project_id, bookmark_id, citation_text, format, metadata) 
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(projectId, bookmarkId, citationText, format, metadata);
  }

  getCitations(projectId) {
    const stmt = this.db.prepare('SELECT * FROM citations WHERE project_id = ? ORDER BY created_at DESC');
    return stmt.all(projectId);
  }

  updateCitation(id, citationText, format, metadata) {
    const stmt = this.db.prepare(`
      UPDATE citations 
      SET citation_text = ?, format = ?, metadata = ? 
      WHERE id = ?
    `);
    return stmt.run(citationText, format, metadata, id);
  }

  deleteCitation(id) {
    const stmt = this.db.prepare('DELETE FROM citations WHERE id = ?');
    return stmt.run(id);
  }
  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(key, value);
  }

  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  }

  // History methods
  addToHistory(url, title = '') {
    // Check if URL already exists in history
    const existingStmt = this.db.prepare('SELECT id, visit_count FROM history WHERE url = ?');
    const existing = existingStmt.get(url);
    
    if (existing) {
      // Update existing entry
      const updateStmt = this.db.prepare(`
        UPDATE history 
        SET title = ?, visit_time = CURRENT_TIMESTAMP, visit_count = visit_count + 1 
        WHERE id = ?
      `);
      return updateStmt.run(title, existing.id);
    } else {
      // Create new entry
      const insertStmt = this.db.prepare(`
        INSERT INTO history (url, title) 
        VALUES (?, ?)
      `);
      return insertStmt.run(url, title);
    }
  }

  getHistory(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM history 
      ORDER BY visit_time DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  searchHistory(query, limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM history 
      WHERE title LIKE ? OR url LIKE ? 
      ORDER BY visit_count DESC, visit_time DESC 
      LIMIT ?
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, limit);
  }

  deleteFromHistory(id) {
    const stmt = this.db.prepare('DELETE FROM history WHERE id = ?');
    return stmt.run(id);
  }

  clearHistory() {
    const stmt = this.db.prepare('DELETE FROM history');
    return stmt.run();
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

module.exports = ScholarLensDB;