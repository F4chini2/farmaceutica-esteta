import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';
import { API, authHeaders } from '../config/api';

function ClientesFull() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', telefone: '', alergias: '', descricao: '', idade: '', cpf: '', endereco: '', instagram: '',
    motivo_avaliacao: '', tratamento_anterior: '', alergia_medicamento: '', uso_medicamento: '',
    usa_filtro_solar: 'false', usa_acido_peeling: 'false', problema_pele: '', gravida: 'false',
    cor_pele: '', biotipo_pele: '', hidratacao: '', acne: '',
    textura_pele: '', envelhecimento: '', rugas: '',
    procedimentos: '', autoriza_fotos: 'false'
  });

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.nome.trim()) {
      alert('O Nome é obrigatório.');
      return;
    }

    // Ajustes mínimos para payload
    const body = { ...form };
    if (body.idade === '') body.idade = null;

    try {
      const resposta = await fetch(`${API}/clientesfull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
      });

      const dados = await resposta.json().catch(() => ({}));

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

  const booleanFields = new Set(['gravida','autoriza_fotos','usa_filtro_solar','usa_acido_peeling']);

  return (
    <div className="container-box">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>
        ⬅ Voltar
      </button>
      <h2> Cadastro Completo do Cliente</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        {Object.entries(form).map(([campo, valor]) => (
          <label key={campo} className="campo-formulario">
            {campo.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            {booleanFields.has(campo) ? (
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
        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>
          Cadastrar Cliente
        </button>
      </form>
    </div>
  );
}

export default ClientesFull;
