# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pen** (codename: ScholarLens) is an Electron desktop app for academic research — an embedded browser with highlighting, notes, citation management, and AI features powered by Google Gemini. Built with Electron 40 + React 19, pure JavaScript (no TypeScript), SQLite via better-sqlite3.

## Commands

```bash
npm start              # Launch dev environment (electron-forge start)
npm run package        # Build distributable
npm run make           # Create platform installers
```

No test runner or linter is configured.

## Architecture

### Process Model (Electron)

- **Main process** (`src/main.js`) — initializes `ScholarLensDB` and `GeminiService`, registers ~30 IPC handlers, creates the BrowserWindow with context isolation enabled
- **Preload** (`src/preload.js`) — exposes three namespaces via `contextBridge`: `window.electronAPI.database.*`, `window.electronAPI.gemini.*`, `window.electronAPI.webview.*`
- **Renderer** (`src/renderer.js`) — React entry point, mounts `<App />` into `#root`

All renderer↔main communication uses `ipcMain.handle` / `ipcRenderer.invoke` (promise-based async IPC). The renderer has no direct Node.js access.

### React Component Tree

`App.jsx` is the root and owns all global state (current project, tabs, UI toggle flags) via `useState` hooks. State flows down via props:

```
App
├── Sidebar (tabs, projects, history, bookmarks)
├── Omnibox (URL/search bar, toggled via state)
├── MainCanvas
│   └── WebView (one per tab, Electron <webview> tag)
├── AnnotationOverlay (text selection UI)
├── NotesPanel (slide-out panel)
├── CitationPanel (slide-out panel)
└── ProjectManager (modal)
```

`WebView.jsx` (819 lines) is the most complex component — it injects JS into loaded pages for highlight/selection detection and emits events back via callbacks.

### Data Layer

SQLite database stored at `{userData}/scholarlens.db`. Schema in `src/database.js` (`ScholarLensDB` class):

- **projects** → **bookmarks** → **notes**, **citations**, **claims** (cascading deletes via foreign keys)
- **history**, **settings** (key-value store for config like `gemini_api_key`)

### AI Integration

`src/gemini-api.js` (`GeminiService`) wraps the Google Generative AI SDK using Gemini 1.5 Flash for: claim detection, citation generation, writing improvement, and content summarization.

### Styling

CSS Variables define an "Academic Calm" color system with semantic naming (`--color-surface-*`, `--color-text-*`). Component-scoped CSS files sit alongside their JSX. Tailwind CSS is also available for utility classes. PostCSS pipeline configured in webpack.

### Build System

Electron Forge + Webpack 5. Three webpack configs:
- `webpack.main.config.js` — main process
- `webpack.renderer.config.js` — renderer with Babel (JSX), CSS/PostCSS, and asset loaders
- `webpack.rules.js` — shared loader rules (native modules, Babel, images)

Build output goes to `.webpack/` (gitignored). Platform makers configured for Windows (Squirrel), macOS (ZIP), and Linux (DEB/RPM).

## Key Patterns

- **No TypeScript** — all source is `.js`/`.jsx` with Babel transpilation
- **No state management library** — prop drilling from `App.jsx`
- **IPC boundary is the security boundary** — never bypass preload; all new main↔renderer calls need entries in both `main.js` handlers and `preload.js` bridge
- **WebView JS injection** — `WebView.jsx` injects scripts into loaded pages for DOM interaction (highlights, selections); changes here must account for arbitrary page DOMs
- **Citation formats** — `src/utils/citationGenerator.js` supports APA, MLA, Chicago, IEEE
