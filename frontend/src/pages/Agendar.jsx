import React, { useState } from 'react';
import './Agendar.css';
import { useParams, useNavigate } from 'react-router-dom';
import { API, authHeaders } from '../config/api';

function Agendar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    data: '',
    horario: '',
    servico: '',
    observacao: ''
  });

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.data || !form.horario || !form.servico) {
      alert('Preencha a data, o horário e o serviço.');
      return;
    }

    try {
      const resposta = await fetch(`${API}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ ...form, cliente_id: id })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Agendamento realizado com sucesso!');
        navigate('/agendamentos');
      } else {
        alert(dados.erro || 'Erro ao criar agendamento');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="agendar-container">
      <button className="btn-voltar" onClick={() => navigate(-1)}>
        ⬅ Voltar
      </button>
      <h2>📅 Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        <label>
          Data:
          <input
            type="date"
            value={form.data}
            onChange={e => handleChange('data', e.target.value)}
            required
          />
        </label>
        <label>
          Horário:
          <input
            type="time"
            value={form.horario}
            onChange={e => handleChange('horario', e.target.value)}
            required
          />
        </label>
        <label>
          Serviço:
          <input
            type="text"
            value={form.servico}
            onChange={e => handleChange('servico', e.target.value)}
            required
          />
        </label>
        <label>
          Nota:
          <textarea
            value={form.observacao}
            onChange={e => handleChange('observacao', e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary">📅 Agendar</button>
      </form>
    </div>
  );
}

export default Agendar;
