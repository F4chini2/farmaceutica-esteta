import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API, apiFetch } from '../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [health, setHealth] = useState('...');
  const [lastError, setLastError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // teste rápido de conectividade
    (async () => {
      try {
        const res = await fetch(`${API}/health`, { method: 'GET' });
        const text = await res.text();
        setHealth(`${res.status} ${text}`);
      } catch (e) {
        setHealth(`erro: ${e?.message || 'falha'}`);
      }
    })();
  }, []);

  const entrar = async (e) => {
    e.preventDefault();
    if (!email || !senha) { alert('Informe e-mail e senha.'); return; }
    try {
      setCarregando(true);
      setLastError('');
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/usuarios');
      } else {
        throw new Error('Resposta sem token');
      }
    } catch (err) {
      const msg = err?.message || 'Falha no login';
      setLastError(msg);
      alert(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }} className="container-box">
      <h2>Acessar conta</h2>

      {/* Debug temporário para diagnosticar "load failed" */}
      <div style={{ fontSize: 12, opacity: 0.8, padding: 8, border: '1px dashed #aaa', borderRadius: 8, marginBottom: 12 }}>
        <div><strong>API:</strong> {API}</div>
        <div><strong>Health:</strong> {health}</div>
        {lastError && <div><strong>Erro:</strong> {lastError}</div>}
      </div>

      <form onSubmit={entrar} style={{ display: 'grid', gap: 12 }}>
        <label>E-mail
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>Senha
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} />
        </label>
        <button className="btn-primary" type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
