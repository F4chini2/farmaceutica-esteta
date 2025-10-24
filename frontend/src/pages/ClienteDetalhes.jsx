import React, { useEffect, useState } from 'react';
import './ClientesFull.css';
import './ClienteDetalhes.css';
import { useParams, useNavigate } from 'react-router-dom';
import { API, authHeaders } from '../config/api';

const booleanFields = new Set(['gravida', 'autoriza_fotos', 'usa_filtro_solar', 'usa_acido_peeling']);
const textAreas = new Set(['descricao', 'procedimentos']);

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const resposta = await fetch(`${API}/clientesfull/${id}`, {
          headers: { ...authHeaders() }
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          const norm = { ...dados };
          booleanFields.forEach((k) => {
            if (k in norm) norm[k] = String(Boolean(norm[k]));
          });
          if (norm.idade == null) norm.idade = '';
          setForm(norm);
        } else {
          alert(dados?.erro || 'Erro ao carregar cliente');
        }
      } catch {
        alert('Erro ao conectar com o servidor');
      }
    };
    fetchCliente();
  }, [id]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSave = async () => {
    try {
      const body = { ...form };
      booleanFields.forEach((k) => {
        if (k in body) body[k] = body[k] === 'true';
      });
      if (body.idade === '') body.idade = null;

      const resposta = await fetch(`${API}/clientesfull/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        alert('Dados do cliente atualizados!');
      } else {
        alert(dados?.erro || 'Erro ao atualizar');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  if (!form) return <p>Carregando cliente...</p>;

  // remove o criado_em
  const todosCampos = Object.keys(form).filter(
    (k) => k !== 'id' && k !== 'criado_em'
  );

  // envia procedimentos e descricao para o fim
  const camposOrdenados = [
    ...todosCampos.filter((k) => !['procedimentos', 'descricao'].includes(k)),
    'procedimentos',
    'descricao',
  ];

  const renderCampo = (campo) => {
    const valor = form[campo] ?? '';
    return (
      <label
        key={campo}
        className={`campo-formulario ${textAreas.has(campo) ? 'full-span' : ''}`}
      >
        {campo.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        {booleanFields.has(campo) ? (
          <select value={valor} onChange={(e) => handleChange(campo, e.target.value)}>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        ) : textAreas.has(campo) ? (
          <textarea value={valor} onChange={(e) => handleChange(campo, e.target.value)} />
        ) : (
          <input
            type={campo === 'idade' ? 'number' : 'text'}
            value={valor}
            onChange={(e) => handleChange(campo, e.target.value)}
          />
        )}
      </label>
    );
  };

  return (
    <div className="container-box cliente-detalhes">
      <button onClick={() => navigate('/dashboard')} className="btn-voltar">⬅ Voltar para Clientes</button>
      <h2>Editar Cliente: {form.nome}</h2>

      <form className="form-agendamento">
        {camposOrdenados.map(renderCampo)}
        <button
          type="button"
          className="btn-primary"
          style={{ gridColumn: 'span 2' }}
          onClick={handleSave}
        >
          💾 Salvar Alterações
        </button>
      </form>
    </div>
  );
}

export default ClienteDetalhes;
