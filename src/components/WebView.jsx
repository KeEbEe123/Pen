import React, { useRef, useEffect, useState } from 'react';
import AnnotationOverlay from './AnnotationOverlay';
import './WebView.css';

const WebView = ({ url, title, tabId, onNavigate, onTitleChange, onLoadingChange, onCreateNote, onHighlight }) => {
  const webviewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || '');
  
  // Annotation state
  const [showAnnotationOverlay, setShowAnnotationOverlay] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // Only update src if it's different from current URL
    if (webview.src !== url && url !== 'about:blank' && url) {
      webview.src = url;
    }

    const handleLoadStart = () => {
      console.log('WebView load started:', url);
      setIsLoading(true);
      onLoadingChange?.(true);
    };

    const handleLoadStop = () => {
      console.log('WebView load completed:', url);
      setIsLoading(false);
      onLoadingChange?.(false);
      
      // Update navigation state
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };

    const handleDidNavigate = (event) => {
      console.log('WebView navigated to:', event.url);
      setCurrentUrl(event.url);
      onNavigate?.(event.url);
      
      // Update navigation state
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
    };

    const handleDidNavigateInPage = (event) => {
      console.log('WebView in-page navigation:', event.url);
      setCurrentUrl(event.url);
      onNavigate?.(event.url);
    };

    const handlePageTitleUpdated = (event) => {
      console.log('WebView title updated:', event.title);
      onTitleChange?.(event.title);
    };

    const handleNewWindow = (event) => {
      console.log('WebView new window requested:', event.url);
      // Prevent new windows and handle in current tab
      event.preventDefault();
      // Navigate current webview to the new URL instead
      webview.loadURL(event.url);
    };

    const handleDidFailLoad = (event) => {
      console.error('WebView failed to load:', event);
      setIsLoading(false);
      onLoadingChange?.(false);
    };

    const handleDomReady = () => {
      console.log('WebView DOM ready');
      
      // Inject content scripts for research features
      webview.executeJavaScript(`
        (function() {
          // Add research-specific functionality
          if (window.scholarLensInjected) {
            console.log('ScholarLens already injected, skipping...');
            return;
          }
          
          window.scholarLensInjected = true;
          console.log('Injecting ScholarLens features...');
          
          // Text selection handler with annotation overlay
          let selectionTimeout;
          
          function handleSelection() {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
              try {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText.length > 0) {
                  console.log('Text selected:', selectedText);
                  
                  const range = selection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  
                  // Store selection globally
                  window.currentSelection = {
                    text: selectedText,
                    selection: selection,
                    range: range.cloneRange(),
                    rect: rect
                  };
                  
                  // Calculate position for annotation overlay
                  const position = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + window.scrollY - 10
                  };
                  
                  // Send selection data to parent via console message
                  console.log('scholarLensTextSelected:' + JSON.stringify({
                    text: selectedText,
                    position: position
                  }));
                }
              } catch (error) {
                console.error('Selection error:', error);
              }
            }, 100);
          }
          
          function highlightText() {
            try {
              if (window.currentSelection && window.currentSelection.range) {
                const range = window.currentSelection.range;
                const span = document.createElement('span');
                span.style.backgroundColor = '#ffeb3b';
                span.style.padding = '2px';
                span.style.borderRadius = '2px';
                span.className = 'scholar-lens-highlight';
                
                range.surroundContents(span);
                window.getSelection().removeAllRanges();
                console.log('Text highlighted successfully');
                return true;
              }
              return false;
            } catch (error) {
              console.error('Highlighting error:', error);
              return false;
            }
          }
          
          function hideAnnotation() {
            console.log('scholarLensHideAnnotation');
          }
          
          // Expose functions globally
          window.scholarLensHighlight = highlightText;
          window.scholarLensHideAnnotation = hideAnnotation;
          
          // Add event listeners
          document.addEventListener('mouseup', handleSelection);
          document.addEventListener('click', function(e) {
            // Hide annotation when clicking elsewhere (but not on highlights)
            if (!e.target.closest('.scholar-lens-highlight')) {
              setTimeout(hideAnnotation, 10);
            }
          });
          
          console.log('ScholarLens features injected successfully');
        })();
      `).catch(error => {
        console.error('Error injecting script:', error);
      });
    };

    // Handle custom events from injected script
    const handleCustomEvents = () => {
      if (!webview) return;
      
      // Listen for text selection events
      webview.executeJavaScript(`
        document.addEventListener('scholarLensTextSelected', function(e) {
          console.log('Custom event received:', e.detail);
        });
        
        document.addEventListener('scholarLensHideAnnotation', function(e) {
          console.log('Hide annotation event received');
        });
      `).catch(error => {
        console.error('Error setting up custom event listeners:', error);
      });
    };

    // Handle messages from webview content - simplified for now
    const handleConsoleMessage = (event) => {
      console.log('WebView console:', event.message);
      
      // Parse console messages for our custom events
      if (event.message && typeof event.message === 'string') {
        if (event.message.includes('scholarLensTextSelected:')) {
          try {
            const data = JSON.parse(event.message.replace('scholarLensTextSelected:', ''));
            setSelectedText(data.text);
            setSelectionPosition(data.position);
            setShowAnnotationOverlay(true);
          } catch (error) {
            console.error('Error parsing text selection data:', error);
          }
        } else if (event.message.includes('scholarLensHideAnnotation')) {
          setShowAnnotationOverlay(false);
        }
      }
    };

    // Add event listeners
    webview.addEventListener('loadstart', handleLoadStart);
    webview.addEventListener('loadstop', handleLoadStop);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    webview.addEventListener('page-title-updated', handlePageTitleUpdated);
    webview.addEventListener('new-window', handleNewWindow);
    webview.addEventListener('did-fail-load', handleDidFailLoad);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('console-message', handleConsoleMessage);
    
    // Set up custom event handling after DOM is ready
    webview.addEventListener('dom-ready', handleCustomEvents);

    return () => {
      webview.removeEventListener('loadstart', handleLoadStart);
      webview.removeEventListener('loadstop', handleLoadStop);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
      webview.removeEventListener('page-title-updated', handlePageTitleUpdated);
      webview.removeEventListener('new-window', handleNewWindow);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('console-message', handleConsoleMessage);
    };
  }, [tabId, onNavigate, onTitleChange, onLoadingChange]); // Removed url from dependencies

  // Separate effect for URL changes
  useEffect(() => {
    const webview = webviewRef.current;
    if (webview && url && url !== 'about:blank' && url !== currentUrl) {
      console.log(`Tab ${tabId}: Loading URL ${url} (current: ${currentUrl})`);
      webview.loadURL(url);
    }
  }, [url, tabId]);

  // Navigation methods
  const goBack = () => {
    const webview = webviewRef.current;
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  };

  const goForward = () => {
    const webview = webviewRef.current;
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  };

  const reload = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.reload();
    }
  };

  const stop = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.stop();
    }
  };

  // Annotation handlers
  const handleCreateNote = (text, noteContent) => {
    onCreateNote?.(text, noteContent, currentUrl, title);
  };

  const handleHighlight = (text) => {
    // Execute highlighting in webview
    const webview = webviewRef.current;
    if (webview) {
      webview.executeJavaScript(`
        if (window.scholarLensHighlight) {
          const result = window.scholarLensHighlight();
          console.log('Highlight result:', result);
        }
      `).catch(error => {
        console.error('Error executing highlight:', error);
      });
    }
    onHighlight?.(text, currentUrl, title);
  };

  const handleCloseAnnotation = () => {
    setShowAnnotationOverlay(false);
  };

  // Handle special URLs
  if (url === 'about:blank' || !url) {
    return (
      <div className="webview-container">
        <div className="blank-page">
          <div className="blank-content">
            <h3>New Tab</h3>
            <p>Enter a URL in the address bar to start browsing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webview-container">
      {/* Navigation Controls */}
      <div className="webview-controls">
        <button 
          className={`nav-btn ${!canGoBack ? 'disabled' : ''}`}
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <button 
          className={`nav-btn ${!canGoForward ? 'disabled' : ''}`}
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <button 
          className="nav-btn"
          onClick={isLoading ? stop : reload}
          title={isLoading ? "Stop loading" : "Reload page"}
        >
          {isLoading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          )}
        </button>
        
        <div className="url-display">
          <span className="current-url">{currentUrl}</span>
        </div>
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* WebView */}
      <webview
        ref={webviewRef}
        src={url}
        className="webview"
        allowpopups="false"
        disablewebsecurity="false"
        nodeintegration="false"
        contextIsolation="true"
        webSecurity="true"
        partition={`persist:tab-${tabId}`}
        useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ScholarLens/1.0"
      />

      {/* Annotation Overlay */}
      <AnnotationOverlay
        isVisible={showAnnotationOverlay}
        position={selectionPosition}
        selectedText={selectedText}
        onCreateNote={handleCreateNote}
        onHighlight={handleHighlight}
        onClose={handleCloseAnnotation}
      />
    </div>
  );
};

export default WebView;