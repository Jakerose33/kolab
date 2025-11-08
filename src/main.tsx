import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Global image error handler for monitoring
window.addEventListener('error', (e) => {
  const target = e.target as any;
  if (target && target.tagName === 'IMG') {
    console.error('[GLOBAL_IMG_ERROR]', {
      src: target.src,
      alt: target.alt,
      error: e.message,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
}, true);

const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <App />
);