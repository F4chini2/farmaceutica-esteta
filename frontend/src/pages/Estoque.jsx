
import './Estoque.css';
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';

function Estoque() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ nome: '', quantidade: '', unidade: '', validade: '' });
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = async () => {
    const token = localStorage.getItem('token');
    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/estoque`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dados = await resposta.json();
      setItens(dados);
    } catch {
      alert('Erro ao buscar estoque');
    }
  };

  const cadastrarItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/estoque`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Item cadastrado com sucesso!');
        setForm({ nome: '', quantidade: '', unidade: '', validade: '' });
        carregarItens();
      } else {
        alert(dados.erro || 'Erro ao cadastrar');
      }
    } catch (err) {
      alert('Erro ao conectar');
    }
  };

  const excluirItem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/estoque/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setItens(prev => prev.filter(i => i.id !== id));
      alert('Item excluído com sucesso!');
    } catch {
      alert('Erro ao excluir');
    }
  };

  const atualizarQuantidade = async (id, delta) => {
    const token = localStorage.getItem('token');
    const item = itens.find(i => i.id === id);
    if (!item) return;

    const novaQuantidade = Math.max(0, Number(item.quantidade) + delta);

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/estoque/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
          prev.map(i =>
            i.id === id ? { ...i, quantidade: novaQuantidade } : i
          )
        );
      } else {
        alert('Erro ao atualizar quantidade');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="estoque-container">
      <Tabs />
      <div className="topo-dashboard">
        <h2>📦 Controle de Estoque</h2>
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
        {itens
          .filter(item => item.nome.toLowerCase().includes(busca.toLowerCase()))
          .map((item) => (
            <div key={item.id} className="card">
              <strong>{item.nome}</strong>
              <p>🧾 {item.quantidade} {item.unidade}</p>
              <p>⏳ Validade: {item.validade ? new Date(item.validade).toLocaleDateString() : 'Sem validade'}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => atualizarQuantidade(item.id, +1)}>➕</button>
                <button onClick={() => atualizarQuantidade(item.id, -1)}>➖</button>
                <button className="btn-danger" onClick={() => excluirItem(item.id)}>🗑️</button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Estoque;
