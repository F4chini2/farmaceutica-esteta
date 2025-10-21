// src/config/api.js
// Define a URL base da API — agora no subdomínio (sem /api)
const raw = import.meta.env.VITE_API_URL || 'https://api.farmaceutica-esteta.com.br';

// remove barras finais para não gerar "//login"
export const API = raw.replace(/\/+$/, '');

// Cabeçalho de autenticação com JWT
export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper para montar URLs (garante apenas 1 barra)
export const apiUrl = (path = '') => `${API}/${String(path).replace(/^\/+/, '')}`;
