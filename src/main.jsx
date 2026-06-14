import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to bypass localtunnel warning screens
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  if (typeof input === 'string' && input.includes('loca.lt')) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set('bypass-tunnel-reminder', 'true');
    } else if (Array.isArray(init.headers)) {
      init.headers.push(['bypass-tunnel-reminder', 'true']);
    } else {
      init.headers['bypass-tunnel-reminder'] = 'true';
    }
  }
  return originalFetch(input, init);
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
