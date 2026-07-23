const BACKEND_URL = "https://msc-cert-verification-api-g2d4d9d9cygwgtd8.centralindia-01.azurewebsites.net";

export const API_BASE = import.meta.env.VITE_BACKEND_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : BACKEND_URL
);

export function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const headers = {
    ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  return fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers
  });
}
