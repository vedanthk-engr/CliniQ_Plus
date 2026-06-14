// src/config.js
// Central API config.
// In production (Vercel), set VITE_API_URL in Vercel's Environment Variables dashboard.
// Locally, it falls back to the localtunnel URL — update this when the tunnel restarts.

export const TUNNEL_URL = import.meta.env.VITE_API_URL || 'https://dry-frog-85.loca.lt';
export const BASE_API = `${TUNNEL_URL}/api`;
