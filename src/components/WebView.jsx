import React, { useRef, useEffect, useState } from 'react';
import AnnotationOverlay from './AnnotationOverlay';
import './WebView.css';

const WebView = ({ url, title, tabId, currentProject, onNavigate, onTitleChange, onLoadingChange, onCreateNote, onHighlight, onCite }) => {
  const webviewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || '');
  
  // Annotation state
  const [showAnnotationOverlay, setShowAnnotationOverlay] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [currentAnchor, setCurrentAnchor] = useState(null);

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
          
          // Store highlights for this page
          window.scholarLensHighlights = new Map();
          
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
                  
                  // Create text quote anchor (robust method)
                  const anchor = createTextQuoteAnchor(range);
                  
                  // Store selection globally
                  window.currentSelection = {
                    text: selectedText,
                    selection: selection,
                    range: range.cloneRange(),
                    rect: rect,
                    anchor: anchor
                  };
                  
                  // Calculate position for annotation overlay (near cursor)
                  // Use viewport coordinates (no scrollY) since overlay uses position: fixed
                  const position = {
                    x: rect.right + 10, // Position to the right of selection
                    y: rect.top + rect.height / 2 // Vertically centered
                  };
                  
                  // Send selection data to parent via console message
                  console.log('scholarLensTextSelected:' + JSON.stringify({
                    text: selectedText,
                    position: position,
                    anchor: anchor
                  }));
                }
              } catch (error) {
                console.error('Selection error:', error);
              }
            }, 100);
          }
          
          // Create Text Quote Anchor (industry-proven method)
          function createTextQuoteAnchor(range) {
            try {
              const exact = range.toString();
              const textContent = document.body.textContent || document.body.innerText;
              
              // Find the position of selected text in full page text
              const beforeRange = document.createRange();
              beforeRange.setStart(document.body, 0);
              beforeRange.setEnd(range.startContainer, range.startOffset);
              const beforeText = beforeRange.toString();
              
              // Get context before and after (30-40 chars)
              const contextLength = 35;
              const prefix = beforeText.slice(-contextLength);
              const suffix = textContent.slice(beforeText.length + exact.length, beforeText.length + exact.length + contextLength);
              
              return {
                exact: exact,
                prefix: prefix,
                suffix: suffix
              };
            } catch (error) {
              console.error('Error creating anchor:', error);
              return { exact: range.toString(), prefix: '', suffix: '' };
            }
          }
          
          // Highlight text using CSS Highlights API (cleanest method)
          function highlightText() {
            try {
              if (!window.currentSelection || !window.currentSelection.range) {
                return { success: false, error: 'No selection' };
              }
              
              const range = window.currentSelection.range;
              const anchor = window.currentSelection.anchor;
              
              // Check if CSS Highlights API is supported
              if (typeof CSS !== 'undefined' && CSS.highlights) {
                // Use CSS Highlights API (no DOM mutation!)
                const highlightId = 'hl-' + Date.now();
                const highlight = new Highlight(range);
                CSS.highlights.set(highlightId, highlight);
                
                // Add dynamic style for this highlight immediately
                if (window.scholarLensAddHighlightStyle) {
                  window.scholarLensAddHighlightStyle(highlightId);
                }
                
                // Add animation using a single animation highlight
                const animHighlight = new Highlight(range);
                CSS.highlights.set('hl-anim', animHighlight);
                
                // Remove animation after it completes
                setTimeout(() => {
                  CSS.highlights.delete('hl-anim');
                }, 1200);
                
                // Store highlight info
                window.scholarLensHighlights.set(highlightId, {
                  id: highlightId,
                  anchor: anchor,
                  range: range
                });
                
                console.log('Text highlighted with CSS Highlights API');
                return { success: true, anchor: anchor, method: 'css-highlights' };
              } else {
                // Fallback: use <mark> element with node splitting
                const startNode = range.startContainer;
                const endNode = range.endContainer;
                
                if (startNode === endNode && startNode.nodeType === 3) {
                  // Simple case: single text node
                  const text = startNode.textContent;
                  const before = text.substring(0, range.startOffset);
                  const selected = text.substring(range.startOffset, range.endOffset);
                  const after = text.substring(range.endOffset);
                  
                  const mark = document.createElement('mark');
                  mark.className = 'scholar-lens-highlight scholar-lens-highlight-animating';
                  mark.style.backgroundColor = '#ffeb3b';
                  mark.style.padding = '2px';
                  mark.style.borderRadius = '2px';
                  mark.textContent = selected;
                  mark.setAttribute('data-highlight-id', 'hl-' + Date.now());
                  
                  // Remove animation class after animation completes
                  setTimeout(() => {
                    mark.classList.remove('scholar-lens-highlight-animating');
                  }, 1200);
                  
                  const parent = startNode.parentNode;
                  parent.replaceChild(document.createTextNode(after), startNode);
                  parent.insertBefore(mark, parent.lastChild);
                  parent.insertBefore(document.createTextNode(before), mark);
                  
                  window.getSelection().removeAllRanges();
                  
                  console.log('Text highlighted with mark element');
                  return { success: true, anchor: anchor, method: 'mark-element' };
                } else {
                  // Complex case: use surroundContents
                  const mark = document.createElement('mark');
                  mark.className = 'scholar-lens-highlight scholar-lens-highlight-animating';
                  mark.style.backgroundColor = '#ffeb3b';
                  mark.style.padding = '2px';
                  mark.style.borderRadius = '2px';
                  mark.setAttribute('data-highlight-id', 'hl-' + Date.now());
                  
                  range.surroundContents(mark);
                  window.getSelection().removeAllRanges();
                  
                  // Remove animation class after animation completes
                  setTimeout(() => {
                    mark.classList.remove('scholar-lens-highlight-animating');
                  }, 1200);
                  
                  console.log('Text highlighted with surroundContents');
                  return { success: true, anchor: anchor, method: 'surround' };
                }
              }
            } catch (error) {
              console.error('Highlighting error:', error);
              return { success: false, error: error.message };
            }
          }
          
          // Restore highlight using Text Quote Anchor
          function restoreHighlight(highlightData) {
            try {
              console.log('Attempting to restore highlight:', highlightData);
              
              const anchor = highlightData.anchor;
              if (!anchor || !anchor.exact) {
                console.error('Invalid anchor data');
                return false;
              }
              
              // Find text using anchor matching
              const textContent = document.body.textContent || document.body.innerText;
              
              // Try to find exact match with context
              let searchText = anchor.prefix + anchor.exact + anchor.suffix;
              let index = textContent.indexOf(searchText);
              
              if (index !== -1) {
                // Found with context, adjust to exact text position
                index += anchor.prefix.length;
              } else {
                // Fallback: search for exact text only
                index = textContent.indexOf(anchor.exact);
              }
              
              if (index === -1) {
                console.log('Could not find text to restore highlight');
                return false;
              }
              
              // Map text index back to DOM node
              const range = findRangeFromTextIndex(index, anchor.exact.length);
              if (!range) {
                console.log('Could not create range for highlight');
                return false;
              }
              
              // Apply highlight using CSS Highlights API if available
              if (typeof CSS !== 'undefined' && CSS.highlights) {
                const highlightId = 'hl-restored-' + (highlightData.id || Date.now());
                const highlight = new Highlight(range);
                CSS.highlights.set(highlightId, highlight);
                
                // Add dynamic style for this highlight
                if (window.scholarLensAddHighlightStyle) {
                  window.scholarLensAddHighlightStyle(highlightId);
                }
                
                window.scholarLensHighlights.set(highlightId, {
                  id: highlightId,
                  anchor: anchor,
                  range: range
                });
                
                console.log('Highlight restored with CSS Highlights API');
                return true;
              } else {
                // Fallback: use mark element
                const mark = document.createElement('mark');
                mark.className = 'scholar-lens-highlight scholar-lens-restored';
                mark.style.backgroundColor = '#ffeb3b';
                mark.style.padding = '2px';
                mark.style.borderRadius = '2px';
                mark.setAttribute('data-highlight-id', 'hl-restored-' + (highlightData.id || Date.now()));
                
                try {
                  range.surroundContents(mark);
                  console.log('Highlight restored with mark element');
                  return true;
                } catch (e) {
                  console.error('Could not wrap highlight:', e);
                  return false;
                }
              }
            } catch (error) {
              console.error('Error restoring highlight:', error);
              return false;
            }
          }
          
          // Find DOM range from text index
          function findRangeFromTextIndex(startIndex, length) {
            try {
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              
              let currentIndex = 0;
              let startNode = null;
              let startOffset = 0;
              let endNode = null;
              let endOffset = 0;
              
              let node;
              while (node = walker.nextNode()) {
                const nodeLength = node.textContent.length;
                
                if (!startNode && currentIndex + nodeLength > startIndex) {
                  startNode = node;
                  startOffset = startIndex - currentIndex;
                }
                
                if (startNode && currentIndex + nodeLength >= startIndex + length) {
                  endNode = node;
                  endOffset = startIndex + length - currentIndex;
                  break;
                }
                
                currentIndex += nodeLength;
              }
              
              if (startNode && endNode) {
                const range = document.createRange();
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);
                return range;
              }
              
              return null;
            } catch (error) {
              console.error('Error finding range:', error);
              return null;
            }
          }
          
          function hideAnnotation() {
            console.log('scholarLensHideAnnotation');
          }
          
          // Add CSS for highlights if using CSS Highlights API
          if (typeof CSS !== 'undefined' && CSS.highlights) {
            const style = document.createElement('style');
            style.textContent = \`
              /* Static highlights - match any hl-* pattern */
              ::highlight(hl-1), ::highlight(hl-2), ::highlight(hl-3), ::highlight(hl-4), ::highlight(hl-5),
              ::highlight(hl-6), ::highlight(hl-7), ::highlight(hl-8), ::highlight(hl-9), ::highlight(hl-10),
              ::highlight(hl-11), ::highlight(hl-12), ::highlight(hl-13), ::highlight(hl-14), ::highlight(hl-15),
              ::highlight(hl-16), ::highlight(hl-17), ::highlight(hl-18), ::highlight(hl-19), ::highlight(hl-20),
              ::highlight(hl-21), ::highlight(hl-22), ::highlight(hl-23), ::highlight(hl-24), ::highlight(hl-25),
              ::highlight(hl-26), ::highlight(hl-27), ::highlight(hl-28), ::highlight(hl-29), ::highlight(hl-30),
              ::highlight(hl-31), ::highlight(hl-32), ::highlight(hl-33), ::highlight(hl-34), ::highlight(hl-35),
              ::highlight(hl-36), ::highlight(hl-37), ::highlight(hl-38), ::highlight(hl-39), ::highlight(hl-40),
              ::highlight(hl-41), ::highlight(hl-42), ::highlight(hl-43), ::highlight(hl-44), ::highlight(hl-45),
              ::highlight(hl-46), ::highlight(hl-47), ::highlight(hl-48), ::highlight(hl-49), ::highlight(hl-50) {
                background-color: #ffeb3b;
                border-radius: 2px;
              }
              
              /* Animated highlights - use attribute selector pattern */
              @keyframes highlightSweep {
                0% {
                  background-color: transparent;
                }
                100% {
                  background-color: #ffeb3b;
                }
              }
              
              /* Animation for new highlights */
              ::highlight(hl-anim) {
                animation: highlightSweep 1.2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
                border-radius: 2px;
              }
            \`;
            document.head.appendChild(style);
            
            // Dynamically add styles for restored highlights as they're created
            window.scholarLensAddHighlightStyle = function(highlightId) {
              const existingStyle = document.getElementById('scholar-lens-dynamic-highlights');
              if (!existingStyle) {
                const dynamicStyle = document.createElement('style');
                dynamicStyle.id = 'scholar-lens-dynamic-highlights';
                document.head.appendChild(dynamicStyle);
              }
              const styleEl = document.getElementById('scholar-lens-dynamic-highlights');
              styleEl.textContent += \`::highlight(\${highlightId}) { background-color: #ffeb3b; border-radius: 2px; }\n\`;
            };
          } else {
            // Add CSS for mark element fallback
            const style = document.createElement('style');
            style.textContent = \`
              .scholar-lens-highlight-animating {
                position: relative;
                overflow: hidden;
              }
              
              .scholar-lens-highlight-animating::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: #ffeb3b;
                animation: highlightSweepMark 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
              }
              
              @keyframes highlightSweepMark {
                0% {
                  left: -100%;
                }
                100% {
                  left: 0;
                }
              }
              
              .scholar-lens-highlight-animating::before {
                animation-duration: 1.2s;
              }
            \`;
            document.head.appendChild(style);
          }
          
          // Expose functions globally
          window.scholarLensHighlight = highlightText;
          window.scholarLensRestoreHighlight = restoreHighlight;
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
      `).then(() => {
        // Wait for DOM to stabilize before restoring highlights
        waitForDOMStability().then(() => {
          restoreHighlightsForCurrentPage();
        });
      }).catch(error => {
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

    // Handle messages from webview content
    const handleConsoleMessage = (event) => {
      // Parse console messages for our custom events
      if (event.message && typeof event.message === 'string') {
        if (event.message.includes('scholarLensTextSelected:')) {
          try {
            const data = JSON.parse(event.message.replace('scholarLensTextSelected:', ''));
            setSelectedText(data.text);
            setSelectionPosition(data.position);
            setCurrentAnchor(data.anchor);
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

  // Wait for DOM to stabilize (handles dynamic content)
  const waitForDOMStability = async () => {
    const webview = webviewRef.current;
    if (!webview) return;

    try {
      await webview.executeJavaScript(`
        new Promise(resolve => {
          let stable = false;
          let lastHeight = document.body.scrollHeight;
          let stableCount = 0;
          
          const interval = setInterval(() => {
            const h = document.body.scrollHeight;
            if (h === lastHeight) {
              stableCount++;
              if (stableCount >= 3) { // Stable for 3 checks (900ms)
                clearInterval(interval);
                console.log('DOM stabilized, ready for highlight restoration');
                resolve(true);
              }
            } else {
              stableCount = 0;
            }
            lastHeight = h;
          }, 300);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(interval);
            console.log('DOM stability timeout, proceeding anyway');
            resolve(true);
          }, 5000);
        });
      `);
    } catch (error) {
      console.error('Error waiting for DOM stability:', error);
    }
  };

  // Function to restore highlights for the current page
  const restoreHighlightsForCurrentPage = async () => {
    const webview = webviewRef.current;
    if (!webview || !currentUrl || currentUrl === 'about:blank' || !currentProject) return;

    try {
      console.log(`Restoring highlights for ${currentUrl} in project ${currentProject.id}`);

      // Fetch highlights for this URL
      const notes = await window.electronAPI.database.getNotesByUrl(currentProject.id, currentUrl);
      const highlights = notes.filter(note => note.highlight_text && note.highlight_text.trim().length > 0);
      
      console.log(`Found ${highlights.length} highlights to restore for ${currentUrl}`);

      // Restore each highlight
      for (const highlight of highlights) {
        // Prefer highlight_anchor over legacy highlight_selector
        const anchorData = highlight.highlight_anchor ? JSON.parse(highlight.highlight_anchor) : null;
        
        await webview.executeJavaScript(`
          if (window.scholarLensRestoreHighlight) {
            window.scholarLensRestoreHighlight({
              id: ${highlight.id},
              text: ${JSON.stringify(highlight.highlight_text)},
              anchor: ${anchorData ? JSON.stringify(anchorData) : `{ exact: ${JSON.stringify(highlight.highlight_text)}, prefix: '', suffix: '' }`}
            });
          }
        `).catch(error => {
          console.error('Error restoring highlight:', error);
        });
      }
    } catch (error) {
      console.error('Error fetching highlights for restoration:', error);
    }
  };

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
  const handleCreateNote = (text, noteContent, tags) => {
    onCreateNote?.(text, noteContent, currentUrl, title, currentAnchor, tags);
  };

  const handleHighlight = (text) => {
    // Execute highlighting in webview
    const webview = webviewRef.current;
    if (webview) {
      webview.executeJavaScript(`
        if (window.scholarLensHighlight) {
          const result = window.scholarLensHighlight();
          console.log('Highlight result:', result);
          result;
        }
      `).then(result => {
        console.log('Highlight executed:', result);
        if (result && result.success) {
          onHighlight?.(text, currentUrl, title, result.anchor || currentAnchor);
        }
      }).catch(error => {
        console.error('Error executing highlight:', error);
      });
    }
  };

  const handleCite = (text) => {
    onCite?.(text, currentUrl, title);
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
        onCite={handleCite}
        onClose={handleCloseAnnotation}
      />
    </div>
  );
};

export default WebView;