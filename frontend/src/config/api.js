// src/config/api.js (corrigido: mantém API sem barras e exporta apiFetch)
const raw = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// remove barras finais para não virar "//login"
export const API = raw.replace(/\/+$/, '');

export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// helper para montar URLs com 1 barra só
export const apiUrl = (path = '') => `${API}/${String(path).replace(/^\/+/, '')}`;

// fetch helper padronizado (JSON + headers + erro claro)
export async function apiFetch(path, opts = {}) {
  const res = await fetch(apiUrl(path), {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(opts.headers || {}),
    },
    ...opts,
  });

  // tenta ler json; se falhar, pega texto
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

  if (!res.ok) {
    const msg = data?.erro || data?.message || res.statusText || 'Erro de requisição';
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}
