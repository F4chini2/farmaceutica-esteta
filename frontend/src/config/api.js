// src/config/api.js

// SEM fallback pra localhost em produção
const raw = import.meta.env.VITE_API_URL;

if (!raw) {
  console.error('VITE_API_URL não definida! Configure no .env.');
}

// remove barras finais para não virar "//login"
export const API = (raw || '').replace(/\/+$/, '');

export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// helper para montar URLs com 1 barra só
export const apiUrl = (path = '') =>
  `${API}/${String(path).replace(/^\/+/, '')}`;
