import './Estoque.css';
import React, { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function Estoque() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ nome: '', quantidade: '', unidade: '', validade: '' });
  const [busca, setBusca] = useState('');

  useEffect(() => { carregarItens(); }, []);

  const carregarItens = async () => {
    try {
      const resposta = await fetch(`${API}/estoque`, {
        headers: { ...authHeaders() }
      });
      const dados = await resposta.json();
      setItens(dados || []);
    } catch {
      alert('Erro ao buscar estoque');
    }
  };

  const cadastrarItem = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch(`${API}/estoque`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Item cadastrado com sucesso!');
        setForm({ nome: '', quantidade: '', unidade: '', validade: '' });
        carregarItens();
      } else {
        alert(dados?.erro || 'Erro ao cadastrar');
      }
    } catch {
      alert('Erro ao conectar');
    }
  };

  const excluirItem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      await fetch(`${API}/estoque/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });

      setItens(prev => prev.filter(i => i.id !== id));
      alert('Item excluído com sucesso!');
    } catch {
      alert('Erro ao excluir');
    }
  };

  const atualizarQuantidade = async (id, delta) => {
    const item = itens.find(i => i.id === id);
    if (!item) return;

    const novaQuantidade = Math.max(0, Number(item.quantidade) + delta);

    try {
      const resposta = await fetch(`${API}/estoque/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          nome: item.nome,
          quantidade: novaQuantidade,
          unidade: item.unidade,
          validade: item.validade
        })
      });

      if (resposta.ok) {
        setItens(prev =>
          prev.map(i => (i.id === id ? { ...i, quantidade: novaQuantidade } : i))
        );
      } else {
        alert('Erro ao atualizar quantidade');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  // ===== PAGINAÇÃO GLOBAL (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // volta pra pág. 1 ao mudar a busca ou a lista
  useEffect(() => { setPage(1); }, [busca, itens]);

  // filtro + ordenação (novos → antigos; fallback id)
  const filtrados = itens.filter((item) =>
    ((item?.nome) || '').toLowerCase().includes(busca.toLowerCase())
  );
  const ordenados = [...filtrados].sort((a, b) => (b?.id || 0) - (a?.id || 0));

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
  // ===========================================

  return (
    <div className="dashboard-container">
      <Tabs />

      <div className="topo-dashboard">
        <h1>📦 Controle de Estoque</h1>
      </div>

      <form className="estoque-form" onSubmit={cadastrarItem}>
        <input
          placeholder="Nome do item"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
          required
        />
        <input
          placeholder="Unidade (ex: ml, unid, mg)"
          value={form.unidade}
          onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.validade}
          onChange={(e) => setForm({ ...form, validade: e.target.value })}
        />
        <button type="submit" className="btn-primary">➕ Adicionar Item</button>
      </form>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar item por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="estoque-lista">
        {visiveis.map((item) => (
          <div key={item.id} className="card">
            <strong>{item.nome}</strong>
            <p>🧾 {item.quantidade} {item.unidade}</p>
            <p>⏳ Validade: {item.validade ? new Date(item.validade).toLocaleDateString() : 'Sem validade'}</p>

            <div className="qtd-group">
              <button
                type="button"
                className="qtd-btn"
                aria-label="Adicionar 1"
                onClick={() => atualizarQuantidade(item.id, +1)}
              >＋</button>

              <span className="qtd-value">{item.quantidade}</span>

              <button
                type="button"
                className="qtd-btn"
                aria-label="Remover 1"
                onClick={() => atualizarQuantidade(item.id, -1)}
                disabled={Number(item.quantidade) <= 0}
              >－</button>

              <button
                type="button"
                className="btn-danger"
                onClick={() => excluirItem(item.id)}
                style={{ marginLeft: '6px' }}
              >🗑️</button>
            </div>
          </div>
        ))}

        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum item encontrado para a busca.</div>
        )}
      </div>

      {/* Paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}
    </div>
  );
}

export default Estoque;
