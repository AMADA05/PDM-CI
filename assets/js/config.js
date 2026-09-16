// PDM-CI — configuration centrale de l'API
// En production, remplacer API_PRODUCTION par l'URL publique exacte du service Render.
const API_PRODUCTION = 'https://pdm-ci.onrender.com';
const API_LOCAL = 'http://localhost:5000';

window.PDM_CONFIG = {
  API_BASE_URL: ['localhost', '127.0.0.1'].includes(window.location.hostname) ? API_LOCAL : API_PRODUCTION,
  TOKEN_KEY: 'pdm_token',
  USER_KEY: 'pdm_user'
};

window.PDM_API = (path = '') => `${window.PDM_CONFIG.API_BASE_URL}${path}`;
window.pdmFetch = (path, options = {}) => {
  const headers = { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const token = localStorage.getItem(window.PDM_CONFIG.TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(window.PDM_API(path), { ...options, headers });
};
