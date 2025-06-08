
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import './NovoCliente.css';

function NovoCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    alergias: '',
    descricao: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3001/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Cliente cadastrado com sucesso!');
        navigate('/dashboard');
      } else {
        alert(dados.erro || 'Erro ao cadastrar cliente');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="detalhes-container">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
        ⬅ Voltar para lista
      </button>
      <h2>Novo Cliente</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        <input
          placeholder="Nome"
          required
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
        <input
          placeholder="Telefone"
          required
          onChange={e => setForm({ ...form, telefone: e.target.value })}
        />
        <input
          placeholder="Alergias"
          onChange={e => setForm({ ...form, alergias: e.target.value })}
        />
        <textarea
          placeholder="Descrição"
          value={form.descricao || ''}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
        <button type="submit">Cadastrar Cliente</button>
      </form>
    </div>
  );
}

export default NovoCliente;
