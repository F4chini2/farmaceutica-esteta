import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';
import Tabs from '../components/Tabs';
import { API, authHeaders } from '../config/api';

export default function ClientesFull() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', telefone: '', alergias: '', descricao: '', idade: '',
    cpf: '', endereco: '', instagram: '',
    motivo_avaliacao: '', tratamento_anterior: '', alergia_medicamento: '', uso_medicamento: '',
    usa_filtro_solar: 'false', usa_acido_peeling: 'false', problema_pele: '', gravida: 'false',
    cor_pele: '', biotipo_pele: '', hidratacao: '', acne: '',
    textura_pele: '', envelhecimento: '', rugas: '',
    procedimentos: '', autoriza_fotos: 'false'
  });

  const booleanFields = new Set(['gravida', 'autoriza_fotos', 'usa_filtro_solar', 'usa_acido_peeling']);

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) { alert('O Nome é obrigatório.'); return; }

    // Ajustes mínimos de payload
    const body = { ...form };
    if (body.idade === '') body.idade = null; // backend já normaliza

    try {
      const res = await fetch(`${API}/clientesfull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('Cliente cadastrado com sucesso!');
        navigate('/dashboard');
      } else {
        alert(data?.erro || 'Erro ao cadastrar cliente');
      }
    } catch {
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="dashboard-container">
      <Tabs />
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>⬅ Voltar</button>
      <h2>Cadastro Completo do Cliente</h2>

      <form onSubmit={handleSubmit} className="form-agendamento">
        {Object.entries(form).map(([campo, valor]) => (
          <label key={campo} className={`campo-formulario ${campo === 'endereco' || campo === 'descricao' ? 'full-span' : ''}`}>
            {campo.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {booleanFields.has(campo) ? (
              <select value={valor} onChange={e => handleChange(campo, e.target.value)}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            ) : (
              campo === 'descricao' ? (
                <textarea value={valor} onChange={e => handleChange(campo, e.target.value)} />
              ) : (
                <input
                  value={valor}
                  onChange={e => handleChange(campo, e.target.value)}
                  type={campo === 'idade' ? 'number' : 'text'}
                />
              )
            )}
          </label>
        ))}
        <button type="submit" className="btn-primary full-span">💾 Cadastrar Cliente</button>
      </form>
    </div>
  );
}
