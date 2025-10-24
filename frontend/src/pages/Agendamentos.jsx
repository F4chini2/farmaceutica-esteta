import React, { useEffect, useState } from 'react';
import './Agendamentos.css';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const resposta = await fetch(`${API}/agendamentos`, {
          headers: { ...authHeaders() }
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
    const resposta = await fetch(
      `${API}/historico/clientes/${agendamento.cliente_id}/historico`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          data: agendamento.data,
          horario: agendamento.horario,
          servico: agendamento.servico,
          observacoes: agendamento.observacoes || null,
        }),
      }
    );

    const dados = await resposta.json().catch(() => ({}));
    if (resposta.ok) {
      setAgendamentos((prev) => prev.filter((a) => a.id !== agendamento.id));
    } else {
      alert(dados.erro || 'Erro ao mover para histórico');
    }
  } catch (err) {
    alert('Erro de conexão');
  }
};

  const excluirAgendamento = async (agendamento) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const resp = await fetch(`${API}/agendamentos/${agendamento.id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (resp.ok) {
        setAgendamentos((prev) => prev.filter((item) => item.id !== agendamento.id));
      } else {
        const dados = await resp.json().catch(() => ({}));
        alert(dados.erro || 'Erro ao excluir');
      }
    } catch {
      alert('Erro de conexão com servidor');
    }
  };

  // ===== PAGINAÇÃO (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [busca, agendamentos]);

  // filtro + ordenação (data desc; fallback id)
  const filtrados = agendamentos.filter(a =>
    a.cliente_nome.toLowerCase().includes(filtro.toLowerCase()) ||
    a.servico.toLowerCase().includes(filtro.toLowerCase()) ||
    a.data.includes(filtro) ||
    a.horario.includes(filtro)
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
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-agendamentos">
        <h1>🗓️ Agendamentos</h1>
      </div>

      <div className="barra-filtros">
  <input
    type="text"
    placeholder="🔍 Buscar por cliente, serviço, data ou horário..."
    value={filtro}
    onChange={(e) => setFiltro(e.target.value)}
    className="barra-pesquisa"
  />
</div>


      <div className="lista-agendamentos">
        {visiveis.map((ag) => (
          <div key={ag.id} className="card">
            <p><strong>👤 Cliente:</strong> {ag.nome_cliente}</p>
            <p><strong>📆 Data:</strong> {ag?.data ? new Date(ag.data).toLocaleDateString() : '-'}</p>
            <p><strong>⏰ Horário:</strong> {(ag?.horario || '').slice(0, 5) || '-'}</p>
            <p><strong>💼 Serviço:</strong> {ag.servico}</p>
            <p><strong>📝 Nota:</strong> {ag.observacoes || 'Nenhuma'}</p>

            <button className="btn-secondary" onClick={() => enviarParaHistorico(ag)}>
              📁 Enviar para Histórico
            </button>
            <button className="btn-danger" onClick={() => excluirAgendamento(ag)}>
              🗑️ Excluir
            </button>
          </div>
        ))}

        {/* card vazio no mesmo estilo dos clientes */}
        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum agendamento encontrado.</div>
        )}
      </div>

      {/* paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}
    </div>
  );
}

export default Agendamentos;
