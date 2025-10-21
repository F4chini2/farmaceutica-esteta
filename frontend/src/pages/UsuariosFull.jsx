// src/pages/UsuariosFull.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsuariosFull.css';
import { API, authHeaders, apiUrl } from '../config/api'; // <— importante

export default function UsuariosFull(){
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('usuario'); // 'usuario' | 'admin'
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  const salvar = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha) { alert('Preencha nome, e-mail e senha.'); return; }

    try {
      setSalvando(true);
      // mapeia para o que o banco realmente armazena
      const tipo = perfil === 'admin' ? 'admin' : 'comum';

      const res = await fetch(apiUrl('/usuarios'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        // envia os dois campos para cobrir backend antigo e novo
        body: JSON.stringify({ nome, email, senha, perfil, tipo })
      });

      const data = await res.json();

      if (res.status === 401) { alert('Sessão expirada. Faça login.'); navigate('/'); return; }
      if (res.status === 403) { alert('Ação permitida apenas para administradores.'); return; }

      if (res.ok) {
        alert(`Usuário cadastrado! Perfil salvo: ${data?.tipo ?? tipo}`);
        navigate('/usuarios');
      } else {
        alert(data?.erro || 'Erro ao salvar usuário');
      }
    } catch {
      alert('Erro de conexão ao salvar usuário');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{maxWidth:560, margin:'40px auto'}} className="container-box usuariosfull">
      <h2>Novo Usuário</h2>
      <form onSubmit={salvar} style={{display:'grid', gap:12}}>
        <label>Nome
          <input value={nome} onChange={e=>setNome(e.target.value)} />
        </label>
        <label>E-mail
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label>Senha
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
        </label>
        <label>Perfil
          <select value={perfil} onChange={e=>setPerfil(e.target.value)}>
            <option value="usuario">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div style={{display:'flex', gap:8, marginTop:6}}>
          <button type="button" className="btn-voltar" onClick={()=>navigate('/usuarios')}>Voltar</button>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
