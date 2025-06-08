import './Estoque.css';
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';

function Estoque() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ nome: '', quantidade: '', unidade: '', validade: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const carregarEstoque = async () => {
      try {
        const resposta = await fetch('http://localhost:3001/estoque', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        setItens(dados);
      } catch (err) {
        console.error('Erro ao buscar estoque:', err);
      }
    };

    carregarEstoque();
  }, []);

  const cadastrarItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3001/estoque', {
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
        // Recarrega a lista de itens após cadastro
        const novaResposta = await fetch('http://localhost:3001/estoque', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const novosDados = await novaResposta.json();
        setItens(novosDados);
      } else {
        alert(dados.erro || 'Erro ao cadastrar');
      }
    } catch (err) {
      alert('Erro ao conectar');
    }
  };

  return (
    <div>
      <Tabs />
      <div className="estoque-container">
        <h2>Controle de Estoque</h2>
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
          <button type="submit">Adicionar</button>
        </form>

        <div className="estoque-lista">
          {itens.map((item) => (
            <div key={item.id} className="estoque-item">
              <strong>{item.nome}</strong>
              <p>{item.quantidade} {item.unidade}</p>
              <p>Validade: {item.validade ? new Date(item.validade).toLocaleDateString() : 'Sem validade'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Estoque;
