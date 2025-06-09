
import './Agendar.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Agendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    data: '', hora: '', procedimento: '', observacoes: ''
  });

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3001/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, cliente_id: id })
      });

      const dados = await resposta.json();
      if (resposta.ok) {
        alert('Agendamento realizado com sucesso!');
        navigate('/dashboard');
      } else {
        alert(dados.erro || 'Erro ao agendar');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="agendar-container">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
        ⬅ Voltar
      </button>
      <h2>📅 Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        <input type="date" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
        <input type="time" value={form.hora} onChange={e => handleChange('hora', e.target.value)} required />
        <input type="text" placeholder="Procedimento" value={form.procedimento} onChange={e => handleChange('procedimento', e.target.value)} required />
        <textarea placeholder="Observações" value={form.observacoes} onChange={e => handleChange('observacoes', e.target.value)} />
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}

export default Agendar;
