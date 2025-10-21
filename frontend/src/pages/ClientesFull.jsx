import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';
import { API, authHeaders } from '../config/api';

function ClientesFull() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', telefone: '', cpf: '', descricao: '', idade: '', alergias: '', endereco: '', instagram: '',
    motivo_avaliacao: '', tratamento_anterior: '', alergia_medicamento: '', uso_medicamento: '',
    usa_filtro_solar: 'false', usa_acido_peeling: 'false', problema_pele: '', gravida: 'false',
    cor_pele: '', biotipo_pele: '', hidratacao: '', acne: '',
    textura_pele: '', envelhecimento: '', rugas: '',
    procedimentos: '', autoriza_fotos: 'false'
  });

  const booleanFields = new Set(['gravida','autoriza_fotos','usa_filtro_solar','usa_acido_peeling']);
  const handleChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CPF agora é opcional
    if (!form.nome) {
      alert('O nome é obrigatório.');
      return;
    }

    try {
      const body = { ...form };
      booleanFields.forEach((k) => { if (k in body) body[k] = body[k] === 'true'; });
      if (body.idade === '') body.idade = null;

      const resposta = await fetch(`${API}/clientesfull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
      });

      const dados = await resposta.json();
      if (resposta.ok) {
        alert('Cliente cadastrado com sucesso!');
        navigate('/dashboard');
      } else {
        alert(dados?.erro || 'Erro ao cadastrar cliente');
      }
    } catch {
      alert('Erro de conexão com o servidor');
    }
  };

  // renderiza tudo, menos descricao e procedimentos, primeiro
  const camposPrimeiros = Object.keys(form).filter(
    (k) => !['descricao', 'procedimentos'].includes(k)
  );

  return (
    <div className="container-box">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>⬅ Voltar</button>
      <h2>🧍 Cadastro Completo do Cliente</h2>

      <form onSubmit={handleSubmit} className="form-agendamento">
        {camposPrimeiros.map((campo) => (
          <label key={campo} className="campo-formulario">
            {campo.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {booleanFields.has(campo) ? (
              <select value={form[campo]} onChange={e => handleChange(campo, e.target.value)}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            ) : (
              <input
                value={form[campo]}
                onChange={e => handleChange(campo, e.target.value)}
                type={campo === 'idade' ? 'number' : 'text'}
              />
            )}
          </label>
        ))}

        {/* Descrição - textarea grande no final */}
        <label className="campo-formulario full-span">
          Descrição
          <textarea
            rows={5}
            value={form.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
          />
        </label>

        {/* Procedimentos - textarea maior no final */}
        <label className="campo-formulario full-span">
          Procedimentos
          <textarea
            rows={8}
            value={form.procedimentos}
            onChange={(e) => handleChange('procedimentos', e.target.value)}
          />
        </label>

        <button type="submit" className="btn-primary full-span">Cadastrar Cliente</button>
      </form>
    </div>
  );
}

export default ClientesFull;
