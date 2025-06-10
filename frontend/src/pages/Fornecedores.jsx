
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import './Fornecedores.css';
import './Historico.css';

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
    const token = localStorage.getItem('token');
    const resposta = await fetch('http://localhost:3001/fornecedores', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dados = await resposta.json();
    setFornecedores(dados);
  };

  const cadastrarFornecedor = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const resp = await fetch('http://localhost:3001/fornecedores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      setForm({ nome: '', cnpj: '', contato: '', email: '', produtos: '', observacoes: '' });
      carregarFornecedores();
    }
  };

  const excluirFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    const token = localStorage.getItem('token');
    const resp = await fetch(`http://localhost:3001/fornecedores/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      setFornecedores(prev => prev.filter(f => f.id !== id));
    } else {
      alert('Erro ao excluir fornecedor');
    }
  };

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>📦 Fornecedores</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por nome, email ou telefone..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <form className="fornecedores-form" onSubmit={cadastrarFornecedor}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        <input placeholder="CNPJ" value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
        <input placeholder="Contato" value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Produtos fornecidos" value={form.produtos} onChange={e => setForm({ ...form, produtos: e.target.value })} />
        <textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
        <button type="submit" className="btn-primary">➕ Cadastrar Fornecedor</button>
      </form>

      <div className="clientes-lista">
        {fornecedores
          .filter(f =>
            (f.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(busca.toLowerCase()) ||
            (f.contato || '').toLowerCase().includes(busca.toLowerCase())
          )
          .map(f => (
            <div key={f.id} className="card">
              <p><strong>📦 Nome:</strong> {f.nome}</p>
              <p><strong>🧾 CNPJ:</strong> {f.cnpj}</p>
              <p><strong>📞 Contato:</strong> {f.contato}</p>
              <p><strong>📧 Email:</strong> {f.email}</p>
              <p><strong>📦 Produtos:</strong> {f.produtos || 'Não informado'}</p>
              <p><strong>📝 Observações:</strong> {f.observacoes || 'Nenhuma'}</p>
              <button className="btn-secondary" onClick={() => navigate(`/fornecedores/${f.id}/boletos`)}>➕ Cadastrar Boleto</button>
              <button className="btn-danger" onClick={() => excluirFornecedor(f.id)}>🗑️ Excluir Fornecedor</button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Fornecedores;
