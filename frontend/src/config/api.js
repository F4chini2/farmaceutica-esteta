// src/config/api.js
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
