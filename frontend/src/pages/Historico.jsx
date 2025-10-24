import React, { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import './ClienteDetalhes.css';
import './Historico.css';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function Historico() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [fotos, setFotos] = useState({});
  const [busca, setBusca] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const resp = await fetch(`${API}/historico/todos`, {
          headers: { ...authHeaders() }
        });
        const dados = await resp.json();
        setProcedimentos(dados || []);

        // carrega fotos de cada registro (paralelo)
        const promises = (dados || []).map(async (p) => {
          try {
            const fotosResp = await fetch(`${API}/historico/historico/${p.id}/fotos`);
            const fotosData = await fotosResp.json();
            setFotos((prev) => ({ ...prev, [p.id]: fotosData || [] }));
          } catch {
            // ignora erro individual de fotos
          }
        });
        await Promise.allSettled(promises);
      } catch {
        alert('Erro ao carregar histórico.');
      }
    };

    carregarHistorico();
  }, []);

  const handleFotoUpload = async (e, historicoId) => {
    const formData = new FormData();
    for (const file of e.target.files) formData.append('fotos', file);

    try {
      const resp = await fetch(`${API}/historico/historico/${historicoId}/fotos`, {
        method: 'POST',
        headers: { ...authHeaders() }, // não setar Content-Type com FormData
        body: formData
      });
      const dados = await resp.json();
      if (resp.ok) {
        setFotos((prev) => ({
          ...prev,
          [historicoId]: [...(prev[historicoId] || []), ...(dados?.fotos || [])]
        }));
      } else {
        alert(dados?.erro || 'Erro ao enviar fotos.');
      }
    } catch {
      alert('Erro de conexão ao enviar fotos.');
    }
  };

  const deletarHistorico = async (id) => {
    if (!window.confirm('Deseja mesmo excluir este histórico?')) return;

    try {
      const resp = await fetch(`${API}/historico/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (resp.ok) {
        setProcedimentos((prev) => prev.filter((p) => p.id !== id));
        setFotos((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
      } else {
        alert('Erro ao excluir histórico.');
      }
    } catch {
      alert('Erro de conexão.');
    }
  };

  const deletarFoto = async (fotoId, historicoId) => {
    if (!window.confirm('Deseja excluir esta foto?')) return;

    try {
      const resp = await fetch(`${API}/historico/foto/${fotoId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (resp.ok) {
        setFotos((prev) => ({
          ...prev,
          [historicoId]: (prev[historicoId] || []).filter((f) => f.id !== fotoId)
        }));
      } else {
        alert('Erro ao excluir a foto.');
      }
    } catch {
      alert('Erro de conexão ao excluir foto.');
    }
  };

  // ===== PAGINAÇÃO GLOBAL (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // volta pra pág. 1 quando busca/lista mudar
  useEffect(() => { setPage(1); }, [busca, procedimentos]);

  // filtro + ordenação (data desc; fallback id)
  const filtrados = procedimentos.filter((proc) =>
    ((proc?.nome_cliente) || '').toLowerCase().includes(busca.toLowerCase()) ||
    ((proc?.servico) || '').toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) => {
    const da = a?.data ? new Date(a.data).getTime() : 0;
    const db = b?.data ? new Date(b.data).getTime() : 0;
    return db - da || (b?.id || 0) - (a?.id || 0);
  });

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ===========================================

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>📂 Histórico</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por cliente ou serviço..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {visiveis.map((proc) => (
          <div key={proc.id} className="card">
            <p><strong>👤 Cliente:</strong> {proc.nome_cliente}</p>
            <p><strong>📆 Data:</strong> {proc?.data ? new Date(proc.data).toLocaleDateString() : '-'}</p>
            <p><strong>⏰ Horário:</strong> {(proc?.horario || '').slice(0, 5) || '-'}</p>
            <p><strong>💆 Serviço:</strong> {proc.servico}</p>
            <p><strong>📝 Nota:</strong> {proc.observacoes || 'Nenhuma'}</p>

            <div className="uploader">
              <p><strong>📸 Fotos:</strong></p>
              <input
                id={`fotos-${proc.id}`}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFotoUpload(e, proc.id)}
               />
               <label className="upload-label" htmlFor={`fotos-${proc.id}`}>
                ⬆️ Escolher arquivos
               </label>
              </div>
              
              {fotos[proc.id] && fotos[proc.id].length > 0 && (
              <div className="fotos-wrapper">
                {fotos[proc.id].map((f) => (
                  <div className="foto-container" key={f.id}>
                    <button className="btn-excluir-foto" onClick={() => deletarFoto(f.id, proc.id)}>🗑️</button>
                    <img
                      src={`${API}${f.url}`}
                      alt="procedimento"
                      className="foto-procedimento"
                      onClick={() => setImagemSelecionada(`${API}${f.url}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <button className="btn-danger" onClick={() => deletarHistorico(proc.id)}>🗑️ Excluir</button>
          </div>
        ))}

        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum registro encontrado.</div>
        )}
      </div>

      {/* Paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}

      {imagemSelecionada && (
        <div className="overlay" onClick={() => setImagemSelecionada(null)}>
          <img src={imagemSelecionada} alt="grande" className="imagem-grande" />
        </div>
      )}
    </div>
  );
}

export default Historico;
