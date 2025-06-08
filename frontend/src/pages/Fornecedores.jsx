
import './Fornecedores.css';
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';

function Fornecedores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ nome: '', contato: '', produtos: '' });
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const carregarFornecedores = async () => {
      try {
        const resposta = await fetch('http://localhost:3001/fornecedores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        setLista(dados);
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
      }
    };

    carregarFornecedores();
  }, []);

  const cadastrar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3001/fornecedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Fornecedor cadastrado!');
        setForm({ nome: '', contato: '', produtos: '' });
        setLista((prev) => [...prev, dados.fornecedor]);
      } else {
        alert(dados.erro || 'Erro ao cadastrar');
      }
    } catch (err) {
      alert('Erro ao conectar');
    }
  };

  return (
    <div className="fornecedores-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>🏭 Fornecedores</h1>
      </div>
      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar fornecedor por nome ou produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <form className="fornecedores-form" onSubmit={cadastrar}>
        <input
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          placeholder="Contato"
          value={form.contato}
          onChange={(e) => setForm({ ...form, contato: e.target.value })}
          required
        />
        <textarea
          placeholder="Produtos fornecidos"
          value={form.produtos}
          onChange={(e) => setForm({ ...form, produtos: e.target.value })}
        />
        <button type="submit">Cadastrar</button>
      </form>

      <div className="fornecedores-lista">
        {lista
          .filter(f =>
            f.nome.toLowerCase().includes(busca.toLowerCase()) ||
            f.produtos.toLowerCase().includes(busca.toLowerCase())
          )
          .map((f) => (
            <div key={f.id} className="fornecedor-item">
              <strong>{f.nome}</strong>
              <p>Contato: {f.contato}</p>
              <p>Produtos: {f.produtos}</p>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Fornecedores;
