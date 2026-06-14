// src/config.js
// Central API config.
// In production (Vercel), set VITE_API_URL in Vercel's Environment Variables dashboard.
// In local dev, defaults to localhost:8000 unless VITE_API_URL is set.

export const TUNNEL_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000' : 'https://unlucky-lion-86.loca.lt');
export const BASE_API = `${TUNNEL_URL}/api`;
