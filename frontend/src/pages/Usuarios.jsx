import React, { useEffect, useState } from 'react';
import { API, authHeaders } from '../config/api';

export default function UsuariosFull() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('comum'); // 'comum' | 'admin'

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch(`${API}/usuarios`, { headers: { ...authHeaders() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || 'Falha ao carregar');
      setLista(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function criarUsuario(e) {
    e.preventDefault();
    if (!email || !senha) { alert('Informe e-mail e senha.'); return; }
    try {
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ email, senha, nome, telefone, descricao, tipo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || 'Erro ao criar usuário');
      // limpa form
      setEmail(''); setSenha(''); setNome(''); setTelefone(''); setDescricao(''); setTipo('comum');
      await carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function tornarAdmin(id, flag) {
    try {
      const res = await fetch(`${API}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ tipo: flag ? 'admin' : 'comum' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || 'Erro ao atualizar perfil');
      await carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remover(id) {
    if (!confirm('Remover este usuário?')) return;
    try {
      const res = await fetch(`${API}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.erro || 'Erro ao remover');
      }
      await carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="usuariosfull p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>

      <form onSubmit={criarUsuario} className="grid gap-3 md:grid-cols-2 bg-[#f7f7fb] p-4 rounded-lg border">
        <div className="flex flex-col">
          <label className="text-sm mb-1">E-mail*</label>
          <input className="border rounded p-2" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Senha*</label>
          <input type="password" className="border rounded p-2" value={senha} onChange={e => setSenha(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Nome</label>
          <input className="border rounded p-2" value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Telefone</label>
          <input className="border rounded p-2" value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm mb-1">Descrição</label>
          <textarea className="border rounded p-2" rows={2} value={descricao} onChange={e => setDescricao(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm mb-1">Perfil</label>
          <select className="border rounded p-2" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="comum">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 rounded bg-black text-white hover:opacity-90" type="submit">
            Criar usuário
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Lista</h2>
        {carregando ? (
          <p>Carregando…</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">E-mail</th>
                  <th className="p-2 border">Nome</th>
                  <th className="p-2 border">Telefone</th>
                  <th className="p-2 border">Perfil</th>
                  <th className="p-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(u => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.id}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.nome || '-'}</td>
                    <td className="p-2 border">{u.telefone || '-'}</td>
                    <td className="p-2 border">{u.tipo}</td>
                    <td className="p-2 border acoes">
                      {u.tipo === 'admin' ? (
                        <button className="px-2 py-1 border rounded" onClick={() => tornarAdmin(u.id, false)}>Tornar comum</button>
                      ) : (
                        <button className="px-2 py-1 border rounded" onClick={() => tornarAdmin(u.id, true)}>Tornar admin</button>
                      )}
                      <button className="px-2 py-1 border rounded" onClick={() => remover(u.id)}>Remover</button>
                    </td>
                  </tr>
                ))}
                {lista.length === 0 && (
                  <tr><td className="p-2 border text-center" colSpan={6}>Sem registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
