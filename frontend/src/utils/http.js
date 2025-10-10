// src/utils/http.js
import { API, authHeaders } from '../config/api';

export async function fetchJson(path, { auth = true, ...opts } = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(auth ? authHeaders() : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(url, { ...opts, headers });

  // tenta decodificar JSON, mesmo em erro
  let data = null;
  try { data = await res.json(); } catch { /* ignora */ }

  if (res.status === 401) {
    // token inválido/expirado -> logout suave
    localStorage.removeItem('token');
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const msg = data?.erro || `Erro ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
