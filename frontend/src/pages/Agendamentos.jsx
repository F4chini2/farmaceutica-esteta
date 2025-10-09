import React, { useEffect, useState } from 'react';
import './Agendamentos.css';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3001/agendamentos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          setAgendamentos(dados);
        } else {
          alert(dados.erro || 'Erro ao buscar agendamentos');
        }
      } catch (err) {
        alert('Erro ao conectar com o servidor');
      }
    };

    fetchAgendamentos();
  }, []);

  const enviarParaHistorico = async (agendamento) => {
    if (!window.confirm('Deseja realmente mover este agendamento para o histórico?')) return;

    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3001/agendamentos/${agendamento.id}/historico`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resposta.ok) {
        setAgendamentos((prev) => prev.filter((a) => a.id !== agendamento.id));
      } else {
        alert('Erro ao mover para histórico');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const excluirAgendamento = async (agendamento) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:3001/agendamentos/${agendamento.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setAgendamentos((prev) => prev.filter((item) => item.id !== agendamento.id));
      } else {
        alert('Erro ao excluir');
      }
    } catch {
      alert('Erro de conexão com servidor');
    }
  };

  // ===== PAGINAÇÃO (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // volta pra pág. 1 ao mudar busca/lista
  useEffect(() => { setPage(1); }, [busca, agendamentos]);

  // filtro + ordenação (data desc; fallback id)
  const filtrados = agendamentos.filter((ag) =>
    ((ag?.nome_cliente) || '').toLowerCase().includes(busca.toLowerCase()) ||
    ((ag?.servico) || '').toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) => {
    const da = a?.data ? new Date(a.data).getTime() : 0;
    const db = b?.data ? new Date(b.data).getTime() : 0;
    return db - da || (b?.id || 0) - (a?.id || 0);
  });

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ====================================

  return (
    <div className="agendamentos-container">
      <Tabs />
      <div className="topo-agendamentos">
        <h1>🗓️ Agendamentos</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por cliente ou serviço..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {ordenados.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <div className="lista-agendamentos">
          {visiveis.map((ag) => (
            <div key={ag.id} className="card">
              <p><strong>👤 Cliente:</strong> {ag.nome_cliente}</p>
              <p><strong>🗓 Data:</strong> {ag?.data ? new Date(ag.data).toLocaleDateString() : '-'}</p>
              <p><strong>⏰ Horário:</strong> {(ag?.horario || '').slice(0, 5) || '-'}</p>
              <p><strong>💼 Serviço:</strong> {ag.servico}</p>
              <p><strong>📝 Observações:</strong> {ag.observacoes || 'Nenhuma'}</p>

              <button className="btn-secondary" onClick={() => enviarParaHistorico(ag)}>
                📁 Enviar para Histórico
              </button>
              <button className="btn-danger" onClick={() => excluirAgendamento(ag)}>
                🗑️ Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={totalPages} onPage={setPage} />
    </div>
  );
}

export default Agendamentos;
