// ClientesFull.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';

function ClientesFull() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', telefone: '', alergias: '', descricao: '', idade: '', cpf: '', endereco: '', instagram: '',
    motivo_avaliacao: '', tratamento_anterior: '', alergia_medicamento: '', uso_medicamento: '',
    usa_filtro_solar: 'false', usa_acido_peeling: 'false', problema_pele: '', gravida: 'false',
    cor_pele: '', biotipo_pele: '', hidratacao: '', acne: '',
    textura_pele: '', envelhecimento: '', rugas: ''
  });

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!form.nome || !form.cpf) {
      alert('Nome e CPF são obrigatórios.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3001/clientesfull', {
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
      <h2>Cadastro Completo do Cliente</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        {Object.entries(form).map(([campo, valor]) => (
          <label key={campo} className="campo-formulario">
            {campo.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {campo.startsWith('usa_') || campo === 'gravida' ? (
              <select value={valor} onChange={e => handleChange(campo, e.target.value)}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            ) : (
              <input
                value={valor}
                onChange={e => handleChange(campo, e.target.value)}
                type={campo === 'idade' ? 'number' : 'text'}
              />
            )}
          </label>
        ))}

        <button type="submit">Cadastrar Cliente</button>

        <button type="submit" style={{ gridColumn: 'span 2' }}>
          Cadastrar Cliente
        </button>
      </form>
    </div>
  );
}

export default ClientesFull;
