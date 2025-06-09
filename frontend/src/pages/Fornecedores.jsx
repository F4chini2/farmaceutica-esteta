import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import './Fornecedores.css';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState({ nome: '', contato: '', email: '', observacoes: '' });
  const [boletos, setBoletos] = useState({});
  const [busca, setBusca] = useState('');

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
      setForm({ nome: '', contato: '', email: '', observacoes: '' });
      carregarFornecedores();
    }
  };

  const cadastrarBoleto = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const dados = boletos[id];
    const resp = await fetch('http://localhost:3001/boletos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...dados, fornecedor_id: id })
    });
    if (resp.ok) {
      alert('Boleto cadastrado com sucesso!');
      setBoletos(prev => ({ ...prev, [id]: {} }));
    } else {
      alert('Erro ao cadastrar boleto');
    }
  };

  return (
    <div className="fornecedores-container">
      <Tabs />
      <h2>📦 Fornecedores</h2>
<input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por nome, email ou telefone..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <form className="fornecedores-form" onSubmit={cadastrarFornecedor}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        <input placeholder="Contato" value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
        <button type="submit">Cadastrar Fornecedor</button>
      </form>

      <div className="fornecedores-lista">
        {fornecedores
          .filter(f =>
            f.nome.toLowerCase().includes(busca.toLowerCase()) ||
            f.email.toLowerCase().includes(busca.toLowerCase()) ||
            f.contato.toLowerCase().includes(busca.toLowerCase())
          )
          .map(f => (
            <div key={f.id} className="fornecedor-item">
              <strong>{f.nome}</strong>
              <p><b>📞</b> {f.contato}</p>
              <p><b>📧</b> {f.email}</p>
              <p><b>📝</b> {f.observacoes || 'Nenhuma'}</p>

              <form onSubmit={(e) => cadastrarBoleto(e, f.id)}>
                <input
                  placeholder="Nº do Boleto"
                  value={boletos[f.id]?.numero || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], numero: e.target.value } }))}
                />
                <input
                  placeholder="Valor"
                  type="number"
                  step="0.01"
                  value={boletos[f.id]?.valor || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], valor: e.target.value } }))}
                />
                <input
                  type="date"
                  value={boletos[f.id]?.vencimento || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], vencimento: e.target.value } }))}
                />
                <textarea
                  placeholder="Observações"
                  value={boletos[f.id]?.observacoes || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], observacoes: e.target.value } }))}
                />
                <button type="submit">💳 Cadastrar Boleto</button>
              </form>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Fornecedores;
