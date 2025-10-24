import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';
import { API, authHeaders } from '../config/api';

// Validação de CPF (algoritmo oficial)
function validaCPF(cpfStr) {
  const cpf = (cpfStr || '').replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais
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

function ClientesFull() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '', telefone: '', cpf: '', alergias: '', idade: '', endereco: '', instagram: '',
    motivo_avaliacao: '', tratamento_anterior: '', alergia_medicamento: '', uso_medicamento: '',
    usa_filtro_solar: 'false', usa_acido_peeling: 'false', problema_pele: '', gravida: 'false',
    cor_pele: '', biotipo_pele: '', hidratacao: '', acne: '',
    textura_pele: '', envelhecimento: '', rugas: '', autoriza_fotos: 'false', procedimentos: '', descricao: ''
  });

  const booleanFields = new Set(['gravida', 'autoriza_fotos', 'usa_filtro_solar', 'usa_acido_peeling']);
  const textAreas = new Set(['descricao', 'procedimentos']);

  const handleChange = (campo, valor) => {
    // idade: apenas dígitos e no máximo 2 caracteres (0–99)
    if (campo === 'idade') {
      const soDigitos = String(valor).replace(/\D/g, '').slice(0, 2);
      setForm(prev => ({ ...prev, idade: soDigitos }));
      return;
    }
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validações mínimas
    if (!form.nome || !form.nome.trim()) return alert('O Nome é obrigatório.');

    // CPF opcional, mas se preenchido precisa ser válido
    const cpfTrim = (form.cpf || '').trim();
    const cpfNumeros = cpfTrim.replace(/\D/g, '');
    if (cpfNumeros.length > 0 && !validaCPF(cpfTrim)) {
      return alert('CPF inválido. Verifique e tente novamente.');
    }

    // monta objeto de envio
    const body = { ...form };

    // normaliza idade (número ou null)
    if (body.idade === '' || body.idade === null || body.idade === undefined) {
      body.idade = null;
    } else {
      const n = Number(body.idade);
      if (Number.isNaN(n)) {
        return alert('Idade inválida.');
      }
      body.idade = n;
    }

    // CPF: se vazio manda null; se preenchido, manda como informado (com ou sem máscara)
    if (!cpfTrim) {
      body.cpf = null;
    } else {
      body.cpf = cpfTrim;
    }

    // normaliza booleanos (enviar como true/false reais)
    for (const k of booleanFields) {
      body[k] = String(form[k]) === 'true';
    }

    // trim em todos os textos
    for (const k of Object.keys(body)) {
      if (typeof body[k] === 'string') body[k] = body[k].trim();
    }

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

  // Mantém DESCRIÇÃO por último; PROCEDIMENTOS vem antes dela
  const camposOrdem = Object.keys(form).filter(c => c !== 'descricao').concat(['descricao']);

  const labelBonita = (campo) =>
    campo
      .replaceAll('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Cpf', 'CPF')
      .replace('Idade', 'Idade (anos)')
      .replace('Uso Medicamento', 'Uso de Medicamento')
      .replace('Alergia Medicamento', 'Alergia a Medicamento')
      .replace('Usa Filtro Solar', 'Usa Filtro Solar')
      .replace('Usa Acido Peeling', 'Usa Ácido/Peeling')
      .replace('Problema Pele', 'Problema de Pele')
      .replace('Tratamento Anterior', 'Tratamento Anterior')
      .replace('Cor Pele', 'Cor da Pele')
      .replace('Biotipo Pele', 'Biotipo da Pele')
      .replace('Textura Pele', 'Textura da Pele')
      .replace('Autoriza Fotos', 'Autoriza Fotos');

  return (
    <div className="container-box">
      <button className="btn-voltar" onClick={() => navigate('/dashboard')}>⬅ Voltar</button>
      <h2>Cadastro Completo do Cliente</h2>

      <form onSubmit={handleSubmit} className="form-agendamento">
        {camposOrdem.map(campo => (
          <label key={campo} className={`campo-formulario ${textAreas.has(campo) ? 'full-span' : ''}`}>
            {labelBonita(campo)}
            {booleanFields.has(campo) ? (
              <select value={form[campo]} onChange={e => handleChange(campo, e.target.value)}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            ) : textAreas.has(campo) ? (
              <textarea
                value={form[campo]}
                onChange={e => handleChange(campo, e.target.value)}
              />
            ) : (
              <input
                // Para limitar 2 dígitos em idade, usamos texto + filtro no onChange
                type={campo === 'idade' ? 'text' : 'text'}
                {...(campo === 'idade'
                  ? { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2, placeholder: '' }
                  : {})}
                value={form[campo]}
                onChange={e => handleChange(campo, e.target.value)}
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
