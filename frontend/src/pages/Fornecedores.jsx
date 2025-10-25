import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import './Fornecedores.css';
import './Historico.css';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState({
    nome: '', cnpj: '', contato: '', email: '', produtos: '', observacoes: ''
  });
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      const resposta = await fetch(`${API}/fornecedores`, {
        headers: { ...authHeaders() }
      });
      const dados = await resposta.json();
      if (resposta.ok) setFornecedores(dados);
      else alert(dados?.erro || 'Erro ao buscar fornecedores');
    } catch {
      alert('Erro ao buscar fornecedores');
    }
  };

  const cadastrarFornecedor = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API}/fornecedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(form)
      });
      const novo = await resp.json();
      if (resp.ok) {
        setForm({ nome: '', cnpj: '', contato: '', email: '', produtos: '', observacoes: '' });
        // coloca o novo no topo para respeitar a ordenação (novos → antigos)
        setFornecedores((prev) => [novo, ...prev]);
      } else {
        alert(novo?.erro || 'Erro ao cadastrar fornecedor');
      }
    } catch {
      alert('Erro ao conectar');
    }
  };

  const excluirFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      const resp = await fetch(`${API}/fornecedores/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (resp.ok) {
        setFornecedores(prev => prev.filter(f => f.id !== id));
      } else {
        alert('Erro ao excluir fornecedor');
      }
    } catch {
      alert('Erro ao excluir fornecedor');
    }
  };

  // ===== PAGINAÇÃO GLOBAL (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // volta pra pág. 1 ao mudar a busca ou a lista
  useEffect(() => { setPage(1); }, [busca, fornecedores]);

  // filtro + ordenação (novos → antigos; fallback id)
  const query = (busca || '').toLowerCase().trim();
  const queryDigits = (busca || '').replace(/\D/g, ''); // para buscar CNPJ por números

  const filtrados = fornecedores.filter((f) => {
    const nome = (f?.nome || '').toLowerCase();
    const email = (f?.email || '').toLowerCase();
    const contato = (f?.contato || '').toLowerCase();
    const produtos = (f?.produtos || '').toLowerCase();
    const cnpjDigits = (f?.cnpj || '').replace(/\D/g, '');

    return (
      nome.includes(query) ||
      email.includes(query) ||
      contato.includes(query) ||
      produtos.includes(query) ||
      (queryDigits && cnpjDigits.includes(queryDigits))
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
        <h1>📦 Fornecedores</h1>
      </div>

      <form className="fornecedores-form" onSubmit={cadastrarFornecedor}>
        <input
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={e => setForm({ ...form, cnpj: e.target.value })}
        />
        <input
          placeholder="Contato"
          value={form.contato}
          onChange={e => setForm({ ...form, contato: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Produtos fornecidos"
          value={form.produtos}
          onChange={e => setForm({ ...form, produtos: e.target.value })}
        />
        <textarea
          placeholder="Observações"
          value={form.observacoes}
          onChange={e => setForm({ ...form, observacoes: e.target.value })}
        />
        <button type="submit" className="btn-primary">➕ Cadastrar Fornecedor</button>
      </form>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por nome, email, contato, CNPJ ou produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {visiveis.map(f => (
          <div key={f.id} className="card">
            <p><strong>📦 Nome:</strong> {f.nome}</p>
            <p><strong>🧾 CNPJ:</strong> {f.cnpj || '-'}</p>
            <p><strong>📞 Contato:</strong> {f.contato || '-'}</p>
            <p><strong>📧 Email:</strong> {f.email || '-'}</p>
            <p><strong>📦 Produtos:</strong> {f.produtos || 'Não informado'}</p>
            <p><strong>📝 Nota:</strong> {f.observacoes || 'Nenhuma'}</p>
            <button className="btn-secondary" onClick={() => navigate(`/fornecedores/${f.id}/boletos`)}>➕ Cadastrar Boleto</button>
            <button className="btn-danger" onClick={() => excluirFornecedor(f.id)}>🗑️ Excluir Fornecedor</button>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="card vazio">Nenhum fornecedor encontrado para a busca.</div>
        )}
      </div>

      {/* Paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}
    </div>
  );
}

export default Fornecedores;
