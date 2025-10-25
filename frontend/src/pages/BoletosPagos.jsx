import React, { useEffect, useState } from 'react';
import './Boletos.css';
import './Historico.css'; // Para zoom e overlay
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function BoletosPagos() {
  const [boletos, setBoletos] = useState([]);
  const [busca, setBusca] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    const fetchBoletos = async () => {
      try {
        const res = await fetch(`${API}/boletos/pagos`, {
          headers: { ...authHeaders() }
        });
        const data = await res.json();
        if (res.ok) setBoletos(data);
        else alert(data.erro || 'Erro ao buscar boletos pagos');
      } catch {
        alert('Erro ao conectar com o servidor');
      }
    };
    fetchBoletos();
  }, []);

  const excluirBoleto = async (id) => {
    if (!window.confirm('Deseja excluir este boleto pago?')) return;
    try {
      const res = await fetch(`${API}/boletos/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
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
      ((b?.vencimento) || '').includes(busca) ||
      ((b?.pago_em) || '').includes(busca)
    );
  });

  const ordenados = [...filtrados].sort((a, b) => {
    const ta = a?.pago_em ? new Date(a.pago_em).getTime()
             : (a?.vencimento ? new Date(a.vencimento).getTime() : 0);
    const tb = b?.pago_em ? new Date(b.pago_em).getTime()
             : (b?.vencimento ? new Date(b.vencimento).getTime() : 0);
    return tb - ta || (b?.id || 0) - (a?.id || 0); // pago_em desc; fallback vencimento/id
  });

  // ===== PAGINAÇÃO (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [busca, boletos]);

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ====================================

  return (
    <div className="dashboard-container">
      <Tabs />
      <h1>✅ Boletos Pagos</h1>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por fornecedor, número, valor, vencimento ou data de pagamento..."
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
            <p><strong>Pago em:</strong> {b.pago_em ? new Date(b.pago_em).toLocaleDateString() : '-'}</p>
            <p><strong>Observações:</strong> {b.observacoes || 'Nenhuma'}</p>

            {b.arquivo && (
              b.arquivo.endsWith('.pdf') ? (
                <a
                  href={`${API}${b.arquivo}`}
                  className="link-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Ver PDF
                </a>
              ) : (
                <img
                  src={`${API}${b.arquivo}`}
                  alt="arquivo"
                  className="foto-procedimento"
                  onClick={() => setImagemSelecionada(`${API}${b.arquivo}`)}
                />
              )
            )}

            <div className="acoes">
              <button className="btn-danger" onClick={() => excluirBoleto(b.id)}>🗑️ Excluir</button>
            </div>
          </div>
        ))}

        {/* card vazio no mesmo estilo dos clientes */}
        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum boleto pago encontrado.</div>
        )}
      </div>

      {/* paginação só quando existir item */}
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

export default BoletosPagos;
