// src/config/api.js
const raw = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// remove barras finais para não virar "//login"
export const API = raw.replace(/\/+$/, '');

export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// helper para montar URLs com 1 barra só
export const apiUrl = (path = '') => `${API}/${String(path).replace(/^\/+/, '')}`;
