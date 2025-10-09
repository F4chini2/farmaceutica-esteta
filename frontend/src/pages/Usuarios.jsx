import './Usuarios.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  // Carregar lista
  const carregar = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('http://localhost:3001/usuarios', { headers });
      const data = await res.json();
      if (res.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        navigate('/');
        return;
      }
      if (res.ok) setUsuarios(data || []);
      else alert(data?.erro || 'Erro ao listar usuários');
    } catch {
      alert('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => { carregar(); }, []);

  // Excluir
  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`http://localhost:3001/usuarios/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) setUsuarios(prev => prev.filter(u => u.id !== id));
      else alert(data?.erro || 'Erro ao excluir usuário');
    } catch {
      alert('Erro ao conectar com o servidor');
    }
  };

  // ===== PAGINAÇÃO GLOBAL (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // volta pra pág. 1 ao mudar busca/lista
  useEffect(() => { setPage(1); }, [busca, usuarios]);

  // filtro + ordenação (novos → antigos; fallback id)
  const filtrados = usuarios.filter((u) => {
    const t = (busca || '').trim().toLowerCase();
    if (!t) return true;
    return (
      ((u?.nome) || '').toLowerCase().includes(t) ||
      ((u?.email) || '').toLowerCase().includes(t) ||
      ((u?.tipo) || '').toLowerCase().includes(t)
    );
  });

  const ordenados = [...filtrados].sort((a, b) => (b?.id || 0) - (a?.id || 0));

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ===========================================

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>👥 Usuários</h1>
        {/* Ajuste a rota abaixo se houver tela de criação */}
        <button className="btn-primary" onClick={() => navigate('/usuarios/novo')}>
          ➕ Novo Usuário
        </button>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por nome, e-mail ou tipo..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="usuarios-lista">
        {visiveis.map((u) => (
          <div key={u.id} className="card">
            <p><strong>🆔 ID:</strong> {u.id}</p>
            <p><strong>👤 Nome:</strong> {u.nome || '-'}</p>
            <p><strong>✉ E-mail:</strong> {u.email || '-'}</p>
            <p><strong>🔒 Tipo:</strong> {u.tipo || 'comum'}</p>
            <p><strong>📞 Telefone:</strong> {u.telefone || '-'}</p>
            <p><strong>📝 Descrição:</strong> {u.descricao || '-'}</p>

            <div className="acoes-card">
              {/* Ajuste navegação se existir rota de edição/detalhes */}
              <button className="btn-danger" onClick={() => deletar(u.id)}>
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="card vazio">Nenhum usuário encontrado para a busca.</div>
        )}
      </div>

      {/* Paginação */}
      <Pagination page={page} total={totalPages} onPage={setPage} />
    </div>
  );
}

export default Usuarios;
