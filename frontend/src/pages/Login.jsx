import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { apiFetch } from '../config/api'; // 👈 troque o import

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const entrar = async (e) => {
    e.preventDefault();
    if (!email || !senha) return alert('Informe e-mail e senha.');
    try {
      setCarregando(true);
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      localStorage.setItem('token', data.token);
      navigate('/usuarios');
    } catch (err) {
      alert(err.message || 'Falha no login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }} className="container-box">
      <h2>Acessar conta</h2>
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
