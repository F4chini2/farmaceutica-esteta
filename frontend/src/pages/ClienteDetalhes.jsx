import React, { useEffect, useState } from 'react';
import './ClientesFull.css';
import './ClienteDetalhes.css';
import { useParams, useNavigate } from 'react-router-dom';
import { API, authHeaders } from '../config/api';

const booleanFields = new Set(['gravida', 'autoriza_fotos', 'usa_filtro_solar', 'usa_acido_peeling']);
const textAreas = new Set(['descricao', 'procedimentos']);

// Validação de CPF (algoritmo oficial)
function validaCPF(cpfStr) {
  const cpf = (cpfStr || '').replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

// Máscara de CPF (só números; formata 000.000.000-00)
function formatCPF(input) {
  const nums = String(input || '').replace(/\D/g, '').slice(0, 11);
  let out = nums;
  if (nums.length > 9) out = `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9,11)}`;
  else if (nums.length > 6) out = `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6)}`;
  else if (nums.length > 3) out = `${nums.slice(0,3)}.${nums.slice(3)}`;
  return out;
}

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

          // garante que CPF exista no form (mesmo se o backend não mandar)
          if (!('cpf' in norm) || norm.cpf == null) norm.cpf = '';

          // normaliza booleanos para "true"/"false" (string) no form
          booleanFields.forEach((k) => {
            if (k in norm) norm[k] = String(Boolean(norm[k]));
          });

          // idade vazia vira string vazia no formulário
          if (norm.idade == null) norm.idade = '';

          // aplica máscara visual no CPF
          norm.cpf = formatCPF(norm.cpf);

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
    if (campo === 'idade') {
      const soDigitos = String(valor).replace(/\D/g, '').slice(0, 2); // 0–99
      setForm((prev) => ({ ...prev, idade: soDigitos }));
      return;
    }
    if (campo === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatCPF(valor) }));
      return;
    }
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSave = async () => {
    try {
      const body = { ...form };

      // CPF opcional, mas se preenchido precisa ser válido
      const cpfTrim = (body.cpf || '').trim();
      const cpfNumeros = cpfTrim.replace(/\D/g, '');
      if (cpfNumeros.length > 0 && !validaCPF(cpfTrim)) {
        alert('CPF inválido. Verifique e tente novamente.');
        return;
      }
      body.cpf = cpfNumeros.length ? cpfTrim : null;

      // booleanos como true/false reais
      booleanFields.forEach((k) => {
        if (k in body) body[k] = String(body[k]) === 'true';
      });

      // idade: número ou null
      if (body.idade === '' || body.idade == null) {
        body.idade = null;
      } else {
        const n = Number(body.idade);
        if (Number.isNaN(n)) {
          alert('Idade inválida.');
          return;
        }
        body.idade = n;
      }

      // trim em todos os textos
      for (const k of Object.keys(body)) {
        if (typeof body[k] === 'string') body[k] = body[k].trim();
      }

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

  // remove o criado_em na edição
  const todosCampos = Object.keys(form).filter(
    (k) => k !== 'id' && k !== 'criado_em'
  );

  // força ordem inicial: Nome, CPF, Telefone; resto; e por fim Procedimentos e Descrição
  const camposOrdenados = [
    'nome',
    'cpf',
    'telefone',
    ...todosCampos.filter((k) =>
      !['nome', 'cpf', 'telefone', 'procedimentos', 'descricao'].includes(k)
    ),
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
            type="text"
            {...(campo === 'idade'
              ? { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2, placeholder: '0–99' }
              : campo === 'cpf'
              ? { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 14, placeholder: '000.000.000-00' }
              : {})}
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
