# ScholarLens Development Todo List

## Phase 1: Foundation & Core Infrastructure

### 1.1 Project Setup
- [x] Initialize Electron app with React + TypeScript
- [x] Configure build pipeline (webpack/vite)
- [x] Set up development environment and hot reload
- [x] Create basic window management and app structure
- [x] Set up SQLite database for local storage
- [x] Configure Google Gemini API integration

### 1.2 Core UI Framework
- [x] Implement "Canvas & Tools" layout system
- [x] Create floating sheet container with 12-16px padding
- [x] Build collapsible sidebar navigation (240px expanded, 64px collapsed)
- [x] Implement corner radii system (20-24px for content container)
- [x] Set up color system ("Academic Calm" palette)
  - [x] Light mode: warm off-white/cream surfaces
  - [x] Dark mode: deep slate/charcoal surfaces
  - [x] Single accent color for active states
- [x] Configure typography system (Inter/geometric sans-serif)
- [x] Create icon system (minimalist line icons, 1.5px stroke)

### 1.3 WebView Integration
- [ ] Implement Electron WebView for web content rendering
- [ ] Create web content container with proper isolation
- [ ] Handle navigation events and URL changes
- [ ] Implement security policies for WebView

## Phase 2: Core Browsing Experience

### 2.1 Omnibox (Address/Search Bar)
- [ ] Create floating, pill-shaped omnibox
- [ ] Implement show/hide behavior (appears when summoned)
- [ ] Add search and navigation functionality
- [ ] Implement focus dimming (30% opacity for rest of interface)

### 2.2 Tab Management
- [ ] Design sidebar-based tab system (list items, not folder tabs)
- [ ] Implement active state styling (soft background fill)
- [ ] Add hover states and transitions
- [ ] Create tab switching with scale animation (98% to 100%)
- [ ] Handle tab creation, closing, and reordering

### 2.3 Navigation & History
- [ ] Implement back/forward navigation
- [ ] Create history management
- [ ] Add bookmark functionality (basic)

## Phase 3: Research-Specific Features

### 3.1 Reading & Annotation System
- [ ] Implement distraction-free reading mode
- [ ] Create text highlighting system for web pages
- [ ] Build annotation overlay system
- [ ] Design note creation and editing interface
- [ ] Implement note-to-highlight linking with metadata
- [ ] Add tagging and categorization for notes
- [ ] Create notes sidebar/panel

### 3.2 Project Management
- [ ] Design project creation workflow
- [ ] Implement project-based organization
- [ ] Create project dashboard/overview
- [ ] Build project switching interface
- [ ] Set up project-specific storage containers

### 3.3 Citation Management
- [ ] Build citation detection system
- [ ] Implement one-click citation generation
- [ ] Support multiple formats (APA, MLA, Chicago, IEEE)
- [ ] Create central reference panel
- [ ] Design citation editing interface
- [ ] Implement citation export functionality

## Phase 4: Advanced Research Tools

### 4.1 Versioned Bookmarks
- [ ] Implement webpage snapshot system
- [ ] Create content change detection
- [ ] Build diff visualization for modified sections
- [ ] Design version history interface
- [ ] Add bookmark organization and search

### 4.2 Claim Tracker (Core Differentiator)
- [ ] Integrate Google Gemini for claim detection
- [ ] Implement statistical data identification
- [ ] Create claim highlighting system
- [ ] Build claim verification interface
- [ ] Design supporting source linking
- [ ] Add claim flagging for citations needed

### 4.3 Writing Workspace
- [ ] Integrate rich text editor (TipTap or Slate)
- [ ] Implement drag-and-drop from notes to documents
- [ ] Create document structure templates
- [ ] Add grammar and style assistance (via Gemini)
- [ ] Build essay structure guidance system
- [ ] Implement auto-save and version control

## Phase 5: Presentation & Export

### 5.1 Presentation Support
- [ ] Create content-to-slides conversion system
- [ ] Implement slide template system
- [ ] Build auto-citation slide generation
- [ ] Add PPT export functionality
- [ ] Create presentation preview interface

### 5.2 Export & Sharing
- [ ] Implement document export (PDF, DOCX)
- [ ] Create citation export (BibTeX, RIS)
- [ ] Build project export/import functionality
- [ ] Add sharing capabilities (if applicable)

## Phase 6: Polish & Optimization

### 6.1 UI/UX Refinements
- [ ] Implement all transition animations (200-300ms, ease-out/ease-in)
- [ ] Add micro-interactions (magnetic hover, scale feedback)
- [ ] Create glassmorphism effects for floating elements
- [ ] Implement proper shadow system (ambient + elevation)
- [ ] Fine-tune spacing and typography

### 6.2 Performance & Reliability
- [ ] Optimize WebView performance
- [ ] Implement offline functionality for saved content
- [ ] Add error handling and recovery
- [ ] Create data backup and restore
- [ ] Optimize database queries and indexing

### 6.3 Security & Privacy
- [ ] Implement local-first storage architecture
- [ ] Add user-controlled AI interaction settings
- [ ] Create clear AI-assisted content indicators
- [ ] Implement data encryption for sensitive content
- [ ] Add privacy controls and data management

## Phase 7: Testing & Deployment

### 7.1 Testing
- [ ] Unit tests for core functionality
- [ ] Integration tests for WebView interactions
- [ ] UI/UX testing across different screen sizes
- [ ] Performance testing with large projects
- [ ] Security testing and vulnerability assessment

### 7.2 Deployment
- [ ] Set up build and packaging pipeline
- [ ] Create installer for different platforms (Windows, macOS, Linux)
- [ ] Implement auto-update system
- [ ] Create user documentation and tutorials
- [ ] Set up crash reporting and analytics (privacy-compliant)

## Technical Debt & Maintenance
- [ ] Code documentation and comments
- [ ] Refactor and optimize codebase
- [ ] Update dependencies and security patches
- [ ] Performance monitoring and optimization
- [ ] User feedback collection and analysis

## Future Enhancements (Post-MVP)
- [ ] Collaborative research projects
- [ ] Peer review and feedback mode
- [ ] Advanced source credibility scoring
- [ ] Cloud sync and cross-device support
- [ ] Mobile companion app
- [ ] Plugin/extension system