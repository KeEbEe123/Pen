# ScholarLens PlantUML Diagrams

## Implementation Overview

ScholarLens is implemented as a desktop application using Electron as the cross-platform framework, with React serving as the frontend UI library and Node.js powering the backend services. The application follows a modular architecture where the main process handles system-level operations, database management, and AI service integration, while the renderer process manages the user interface through React components. The core functionality revolves around a WebView component that enables web browsing with enhanced research capabilities, including text highlighting, annotation overlays, and real-time content analysis. The database layer uses SQLite with the better-sqlite3 library for local data persistence, storing projects, bookmarks, notes, citations, and browsing history in a structured relational format that supports complex queries and maintains data integrity through foreign key constraints.

The AI integration leverages Google's Gemini 2.5 Flash model to provide intelligent research assistance, including automatic claim detection, citation generation, writing improvement suggestions, and content summarization. The application implements a sophisticated IPC (Inter-Process Communication) system using Electron's built-in mechanisms to facilitate secure communication between the main process and renderer processes, ensuring that sensitive operations like database access and API calls are properly isolated. The user interface employs a "Canvas & Tools" design philosophy with a collapsible sidebar for navigation, floating panels for notes and citations, and a context-aware omnibox for search and navigation. The component architecture promotes reusability and maintainability, with each major feature encapsulated in its own React component that manages its state and communicates with parent components through well-defined props and callback interfaces, while the global application state is managed through React hooks and context providers.

## System Evaluation and Testing

To evaluate the functionality and performance of the proposed ScholarLens research-centric browser system, a working prototype was developed and tested across multiple research workflows. The prototype demonstrates AI-powered claim detection, automatic citation generation, text highlighting with persistent annotations, project-based research organization, and intelligent content analysis within a comprehensive desktop environment. The system successfully conducted research sessions where users created different project modules such as Academic Research, Journalism Investigation, and Content Writing projects. During the research process, the system captured web content dynamically and recorded user annotations through text highlighting and note-taking interfaces. The content analysis module processed the collected information and sent it to the AI evaluation system for claim verification and citation assistance.

The evaluation process was performed using the Google Gemini AI API, which analyzed research content based on parameters such as factual accuracy, citation requirements, and claim verification needs. The system generated automated citations in multiple formats (APA, MLA, Chicago) and provided writing improvement suggestions after analyzing each piece of content. This automated research assistance helped simulate a comprehensive academic research environment and allowed researchers to understand content credibility and citation requirements effectively. System performance was validated by testing multiple research sessions, content bookmarking, and AI-powered analysis workflows. The platform successfully handled web content capture, annotation processing, and AI feedback generation without significant delays, confirming that the system can provide interactive and real-time research assistance for users. The results demonstrate that the ScholarLens system effectively supports academic and professional research by providing automated citation management, intelligent claim detection, and comprehensive research organization tools, validating that the proposed system improves research efficiency, source credibility verification, and knowledge synthesis workflows.

## 1. Use Case Diagram

```plantuml
@startuml
!theme plain
title ScholarLens Use Case Diagram

actor "User" as user

rectangle "ScholarLens System" {
  
  package "Project Management" {
    usecase "Create Project" as UC1
    usecase "Manage Projects" as UC2
  }
  
  package "Web Research" {
    usecase "Browse Web" as UC3
    usecase "Bookmark Pages" as UC4
    usecase "Search History" as UC5
  }
  
  package "Content Analysis" {
    usecase "Highlight & Annotate" as UC6
    usecase "Create Notes" as UC7
    usecase "Detect Claims" as UC8
  }
  
  package "Citation Management" {
    usecase "Generate Citations" as UC9
    usecase "Export References" as UC10
  }
  
  package "AI Assistance" {
    usecase "Writing Support" as UC11
    usecase "Claim Verification" as UC12
  }
}

user --> UC1
user --> UC2

user --> UC3
user --> UC4
user --> UC5

user --> UC6
user --> UC7
user --> UC8

user --> UC9
user --> UC10

user --> UC11
user --> UC12

UC6 ..> UC7 : <<extends>>
UC7 ..> UC9 : <<extends>>
UC8 ..> UC12 : <<extends>>

@enduml
```

## 2. Class Diagram

```plantuml
@startuml
!theme plain
title ScholarLens Class Diagram

class App {
  -sidebarCollapsed: boolean
  -omniboxVisible: boolean
  -currentProject: Project
  -projects: Project[]
  -activeTab: Tab
  -tabs: Tab[]
  -showNotesPanel: boolean
  -showCitationPanel: boolean
  
  +initializeApp(): void
  +createProject(name, description): void
  +switchProject(project): void
  +createNewTab(url, title): void
  +switchTab(tabId): void
  +closeTab(tabId): void
}

class Sidebar {
  -collapsed: boolean
  -projects: Project[]
  -tabs: Tab[]
  
  +onToggle(): void
  +onTabSwitch(tabId): void
  +onNewTab(): void
  +onProjectSwitch(project): void
}

class MainCanvas {
  -activeTab: Tab
  -sidebarCollapsed: boolean
  
  +onShowOmnibox(): void
  +onTabUpdate(tabId, updates): void
}

class WebView {
  -url: string
  -isLoading: boolean
  -canGoBack: boolean
  -canGoForward: boolean
  
  +loadURL(url): void
  +goBack(): void
  +goForward(): void
  +reload(): void
}

class NotesPanel {
  -isVisible: boolean
  -notes: Note[]
  
  +onClose(): void
  +onNavigateToUrl(url): void
  +createNote(content, highlight): void
}

class CitationPanel {
  -isVisible: boolean
  -citations: Citation[]
  
  +onClose(): void
  +generateCitation(bookmark): void
  +updateCitation(id, text): void
}

class Omnibox {
  -visible: boolean
  
  +onHide(): void
  +onNavigate(url): void
  +handleSearch(query): void
}

class ScholarLensDB {
  -db: Database
  -dbPath: string
  
  +initialize(): boolean
  +createProject(name, description): Project
  +getProjects(): Project[]
  +createBookmark(projectId, url, title): Bookmark
  +createNote(projectId, content, highlight): Note
  +createCitation(projectId, text, format): Citation
  +addToHistory(url, title): void
}

class GeminiService {
  -genAI: GoogleGenerativeAI
  -model: GenerativeModel
  -apiKey: string
  
  +initialize(apiKey): boolean
  +detectClaims(text): ClaimResult[]
  +generateCitation(url, title, author): string
  +improveWriting(text, context): WritingResult
  +summarizeContent(text, maxLength): string
}

class Project {
  +id: number
  +name: string
  +description: string
  +createdAt: Date
  +updatedAt: Date
}

class Tab {
  +id: string
  +url: string
  +title: string
  +isActive: boolean
  +isLoading: boolean
  +createdAt: number
}

class Bookmark {
  +id: number
  +projectId: number
  +url: string
  +title: string
  +content: string
  +snapshotHtml: string
  +createdAt: Date
}

class Note {
  +id: number
  +projectId: number
  +bookmarkId: number
  +content: string
  +highlightText: string
  +highlightPosition: string
  +tags: string
  +url: string
  +pageTitle: string
}

class Citation {
  +id: number
  +projectId: number
  +bookmarkId: number
  +citationText: string
  +format: string
  +metadata: string
}

App ||--|| Sidebar
App ||--|| MainCanvas
App ||--|| NotesPanel
App ||--|| CitationPanel
App ||--|| Omnibox

App --> ScholarLensDB
App --> GeminiService

MainCanvas ||--|| WebView

App --> Project
App --> Tab

ScholarLensDB --> Project
ScholarLensDB --> Bookmark
ScholarLensDB --> Note
ScholarLensDB --> Citation

NotesPanel --> Note
CitationPanel --> Citation

@enduml
```

## 3. Activity Diagram

```plantuml
@startuml
!theme plain
title ScholarLens Research Workflow Activity Diagram

start

:User opens ScholarLens;

:Load existing projects or 
create new project;

partition "Web Browsing" {
  :Navigate to research source;
  
  :Read content;
  
  if (Found important information?) then (yes)
    :Select text to highlight;
    
    :Create note with highlight;
    
    :Add tags to note;
  else (no)
    :Continue reading;
  endif
}

partition "Content Analysis" {
  if (AI features enabled?) then (yes)
    :Detect claims in content;
    
    :Flag claims needing verification;
    
    :Generate automatic citations;
  else (no)
    :Manual citation creation;
  endif
}

partition "Research Management" {
  :Bookmark important pages;
  
  :Organize notes by project;
  
  :Review collected citations;
  
  if (Need to verify claims?) then (yes)
    :Use AI claim verification;
    
    :Cross-reference sources;
  else (no)
  endif
}

partition "Writing Assistance" {
  if (Ready to write?) then (yes)
    :Use AI writing assistance;
    
    :Drag notes into document;
    
    :Generate bibliography;
    
    :Export final document;
  else (no)
    :Continue research;
  endif
}

:Save project progress;

stop

@enduml
```

## 4. Sequence Diagram

```plantuml
@startuml
!theme plain
title ScholarLens Note Creation Sequence Diagram

actor User
participant "App" as App
participant "WebView" as WV
participant "NotesPanel" as NP
participant "ScholarLensDB" as DB
participant "GeminiService" as AI

User -> App: Select text on webpage

App -> WV: Get selected text and position

WV -> App: Return selection data

User -> App: Click "Create Note" button

App -> NP: Show notes panel with selection

NP -> User: Display note creation form

User -> NP: Enter note content and tags

NP -> App: Submit note data

App -> DB: createNote(projectId, content, highlight, tags)

DB -> DB: Insert note into database

DB -> App: Return note ID

alt AI features enabled
  App -> AI: detectClaims(noteContent)
  
  AI -> AI: Analyze text for claims
  
  AI -> App: Return detected claims
  
  App -> NP: Highlight potential claims
end

App -> NP: Update notes list

NP -> User: Show success message

User -> App: Continue browsing

App -> WV: Inject highlight restoration script

WV -> WV: Restore highlights on page

@enduml
```

## 5. System Architecture Diagram

```plantuml
@startuml
!theme plain
title ScholarLens System Architecture

package "Desktop Application (Electron)" {
  
  package "Main Process" {
    component "Application Controller" as AppCtrl
    component "IPC Handler" as IPC
    component "Window Manager" as WinMgr
  }
  
  package "Renderer Process" {
    
    package "UI Layer (React)" {
      component "App Component" as App
      component "Sidebar" as Sidebar
      component "MainCanvas" as Canvas
      component "WebView" as WebView
      component "NotesPanel" as Notes
      component "CitationPanel" as Citations
      component "Omnibox" as Omnibox
    }
    
    package "State Management" {
      component "React Hooks" as Hooks
      component "Context Providers" as Context
    }
  }
  
  package "Services Layer" {
    component "Database Service" as DBService
    component "AI Service" as AIService
    component "Citation Generator" as CitGen
  }
  
  package "Data Layer" {
    database "SQLite Database" as DB {
      component "Projects" as ProjTable
      component "Bookmarks" as BookTable
      component "Notes" as NotesTable
      component "Citations" as CitTable
      component "History" as HistTable
    }
  }
}

cloud "External Services" {
  component "Google Gemini API" as GeminiAPI
  component "Web Content" as WebContent
}

package "File System" {
  component "User Data Directory" as UserData
  component "Application Resources" as AppRes
}

' Main Process connections
AppCtrl --> WinMgr
AppCtrl --> IPC
IPC --> DBService
IPC --> AIService

' Renderer Process connections
App --> Sidebar
App --> Canvas
App --> Notes
App --> Citations
App --> Omnibox
Canvas --> WebView

App --> Hooks
App --> Context

' Service connections
DBService --> DB
AIService --> GeminiAPI
CitGen --> AIService

' Database relationships
DB --> ProjTable
DB --> BookTable
DB --> NotesTable
DB --> CitTable
DB --> HistTable

' External connections
WebView --> WebContent
AIService --> GeminiAPI

' File system connections
DBService --> UserData
AppCtrl --> AppRes

' IPC communication
IPC <--> App : "Secure Communication"

@enduml
```
## 6. Proposed Technique Block Diagram

```plantuml
@startuml
!theme plain
title ScholarLens Proposed Technique Block Diagram

rectangle "Input Layer" {
  rectangle "Web Content\nIngestion" as WebInput
  rectangle "User Text\nSelection" as TextSelect
  rectangle "Manual Note\nEntry" as ManualInput
}

rectangle "Processing Layer" {
  
  rectangle "Content Analysis Engine" {
    rectangle "Text Extraction\n& Parsing" as TextParse
    rectangle "Semantic Analysis\n(NLP)" as NLP
    rectangle "Claim Detection\nAlgorithm" as ClaimDetect
  }
  
  rectangle "AI Processing Module" {
    rectangle "Google Gemini\nAPI Integration" as GeminiInt
    rectangle "Prompt Engineering\n& Context Building" as PromptEng
    rectangle "Response Processing\n& Validation" as ResponseProc
  }
  
  rectangle "Citation Management Engine" {
    rectangle "Metadata\nExtraction" as MetaExtract
    rectangle "Citation Format\nGeneration" as CitFormat
    rectangle "Reference\nValidation" as RefValid
  }
  
  rectangle "Annotation System" {
    rectangle "Highlight Position\nTracking" as HighlightTrack
    rectangle "DOM Anchor\nGeneration" as DOManchor
    rectangle "Persistent Storage\nMapping" as PersistMap
  }
}

rectangle "Storage & Management Layer" {
  
  rectangle "Database Operations" {
    rectangle "SQLite\nTransactions" as SQLTrans
    rectangle "Relational Data\nManagement" as RelData
    rectangle "Query Optimization\n& Indexing" as QueryOpt
  }
  
  rectangle "Project Organization" {
    rectangle "Hierarchical\nStructure" as HierStruct
    rectangle "Cross-Reference\nLinking" as CrossRef
    rectangle "Version Control\n& History" as VersionCtrl
  }
}

rectangle "Output Layer" {
  rectangle "Research Dashboard\n& Visualization" as Dashboard
  rectangle "Citation Export\n(Multiple Formats)" as CitExport
  rectangle "Writing Assistance\n& Feedback" as WriteAssist
  rectangle "Claim Verification\nReports" as ClaimReports
}

' Input connections
WebInput --> TextParse
TextSelect --> HighlightTrack
ManualInput --> NLP

' Processing connections
TextParse --> NLP
NLP --> ClaimDetect
ClaimDetect --> GeminiInt

GeminiInt --> PromptEng
PromptEng --> ResponseProc
ResponseProc --> CitFormat

MetaExtract --> CitFormat
CitFormat --> RefValid

HighlightTrack --> DOManchor
DOManchor --> PersistMap

' Storage connections
ResponseProc --> SQLTrans
RefValid --> RelData
PersistMap --> QueryOpt

SQLTrans --> HierStruct
RelData --> CrossRef
QueryOpt --> VersionCtrl

' Output connections
HierStruct --> Dashboard
CrossRef --> CitExport
VersionCtrl --> WriteAssist
ClaimDetect --> ClaimReports

@enduml
```