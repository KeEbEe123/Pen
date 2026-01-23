import React, { useRef, useEffect } from 'react';
import './WebView.css';

const WebView = ({ url, title, tabId }) => {
  const webviewRef = useRef(null);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => {
      console.log('WebView load started:', url);
    };

    const handleLoadStop = () => {
      console.log('WebView load completed:', url);
    };

    const handleNavigate = (event) => {
      console.log('WebView navigated to:', event.url);
    };

    const handleNewWindow = (event) => {
      console.log('WebView new window requested:', event.url);
      // Prevent new windows and handle in current tab
      event.preventDefault();
    };

    webview.addEventListener('loadstart', handleLoadStart);
    webview.addEventListener('loadstop', handleLoadStop);
    webview.addEventListener('did-navigate', handleNavigate);
    webview.addEventListener('new-window', handleNewWindow);

    return () => {
      webview.removeEventListener('loadstart', handleLoadStart);
      webview.removeEventListener('loadstop', handleLoadStop);
      webview.removeEventListener('did-navigate', handleNavigate);
      webview.removeEventListener('new-window', handleNewWindow);
    };
  }, [url]);

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
      <webview
        ref={webviewRef}
        src={url}
        className="webview"
        allowpopups="false"
        disablewebsecurity="false"
        nodeintegration="false"
        contextIsolation="true"
        webSecurity="true"
        partition="persist:main"
      />
    </div>
  );
};

export default WebView;