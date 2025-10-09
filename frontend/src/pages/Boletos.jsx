import React, { useEffect, useState } from 'react';
import './Boletos.css';
import './Historico.css'; // Importa o estilo do Histórico
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';

function Boletos() {
  const [boletos, setBoletos] = useState([]);
  const [busca, setBusca] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    const fetchBoletos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/boletos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setBoletos(data);
        else alert(data.erro || 'Erro ao buscar boletos');
      } catch {
        alert('Erro ao conectar com o servidor');
      }
    };
    fetchBoletos();
  }, []);

  const marcarComoPago = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/boletos/${id}/pagar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setBoletos((prev) => prev.filter((b) => b.id !== id));
      else alert('Erro ao marcar como pago');
    } catch {
      alert('Erro ao conectar com o servidor');
    }
  };

  const excluirBoleto = async (id) => {
    if (!window.confirm('Deseja excluir este boleto?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/boletos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setBoletos((prev) => prev.filter((b) => b.id !== id));
      else alert('Erro ao excluir boleto');
    } catch {
      alert('Erro ao conectar com o servidor');
    }
  };

  // ===== BUSCA + ORDENAÇÃO =====
  const filtrados = boletos.filter((b) => {
    const q = (busca || '').toLowerCase();
    return (
      ((b?.nome_fornecedor) || '').toLowerCase().includes(q) ||
      ((b?.numero) || '').toLowerCase().includes(q) ||
      String(b?.valor ?? '').includes(busca) ||
      ((b?.vencimento) || '').includes(busca)
    );
  });

  const ordenados = [...filtrados].sort((a, b) => {
    const da = a?.vencimento ? new Date(a.vencimento).getTime() : 0;
    const db = b?.vencimento ? new Date(b.vencimento).getTime() : 0;
    return db - da || (b?.id || 0) - (a?.id || 0); // vencimento desc; fallback id
  });

  // ===== PAGINAÇÃO GLOBAL (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [busca, boletos]);

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ===========================================

  return (
    <div className="dashboard-container">
      <Tabs />
      <h1>📄 Boletos Pendentes</h1>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por fornecedor, número, valor ou vencimento..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {visiveis.map((b) => (
          <div key={b.id} className="card">
            <p><strong>Fornecedor:</strong> {b.nome_fornecedor}</p>
            <p><strong>Número:</strong> {b.numero}</p>
            <p><strong>Valor:</strong> R$ {b.valor}</p>
            <p><strong>Vencimento:</strong> {b.vencimento ? new Date(b.vencimento).toLocaleDateString() : '-'}</p>
            <p><strong>Observações:</strong> {b.observacoes || 'Nenhuma'}</p>

            {b.arquivo && (
              b.arquivo.endsWith('.pdf') ? (
                <a
                  href={`http://localhost:3001${b.arquivo}`}
                  className="link-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Ver PDF
                </a>
              ) : (
                <img
                  src={`http://localhost:3001${b.arquivo}`}
                  alt="arquivo"
                  className="foto-procedimento"
                  onClick={() => setImagemSelecionada(`http://localhost:3001${b.arquivo}`)}
                />
              )
            )}

            <div className="acoes">
              <button className="btn-secondary" onClick={() => marcarComoPago(b.id)}>✅ Marcar como Pago</button>
              <button className="btn-danger" onClick={() => excluirBoleto(b.id)}>🗑️ Excluir</button>
            </div>
          </div>
        ))}

        {/* card vazio com o mesmo visual dos clientes */}
        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum boleto encontrado.</div>
        )}
      </div>

      {/* Paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}

      {imagemSelecionada && (
        <div className="overlay" onClick={() => setImagemSelecionada(null)}>
          <img src={imagemSelecionada} alt="Visualização" className="imagem-grande" />
        </div>
      )}
    </div>
  );
}

export default Boletos;
