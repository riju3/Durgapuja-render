import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── In-Memory Page & API Data Cache Store ──────────────────────────────
const memoryCache = new Map();

export const hasCached = (url) => memoryCache.has(url);

export const getCached = async (url) => {
  if (memoryCache.has(url)) {
    return memoryCache.get(url);
  }
  const res = await api.get(url);
  memoryCache.set(url, res);
  return res;
};

export const clearMemoryCache = (url) => {
  if (url) {
    memoryCache.delete(url);
  } else {
    memoryCache.clear();
  }
};

export default api;
