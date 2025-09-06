import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Dynamically determine the base path from the current URL.
    // This is more robust than relying on build-time environment variables
    // which were causing a runtime error.
    const path = window.location.pathname;
    const scope = path.substring(0, path.lastIndexOf('/') + 1);

    navigator.serviceWorker.register(`${scope}sw.js`)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
