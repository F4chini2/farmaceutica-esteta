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

// wrapper simples de fetch já com cabeçalhos e JSON
export async function apiFetch(path, opts = {}) {
  const url = apiUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(opts.headers || {})
  };
  const res = await fetch(url, { ...opts, headers });
  // tenta parsear JSON sempre que possível
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.erro || data.message)) || `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
