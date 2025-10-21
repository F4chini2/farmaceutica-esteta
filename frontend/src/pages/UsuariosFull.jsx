import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsuariosFull.css';
import { API, authHeaders } from '../config/api'; // adiciona isso pra usar o mesmo padrão das outras telas

export default function UsuariosFull() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('usuario');
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  const salvar = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      alert('Preencha nome, e-mail e senha.');
      return;
    }
    try {
      setSalvando(true);
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || 'Erro ao criar usuário.');
      alert('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('usuario');
    } catch (err) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="usuariosfull">
      <button onClick={() => navigate(-1)} className="btn-voltar">⬅ Voltar</button>
      <h2>👥 Cadastrar Usuário</h2>

      <form onSubmit={salvar}>
        <label>Nome*
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>

        <label>E-mail*
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>Senha*
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>

        <label>Perfil
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="usuario">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : '💾 Salvar'}
        </button>
      </form>
    </div>
  );
}
