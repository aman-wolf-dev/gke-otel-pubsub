// frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initOtel } from './otel-browser';
import './index.css'; // optional - create a minimal file or remove if you don't have it

// initialize OpenTelemetry for the browser (sets propagator, instrumentation, etc.)
initOtel();

const container = document.getElementById('root');
if (!container) {
  throw new Error('No #root element found in public/index.html');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);