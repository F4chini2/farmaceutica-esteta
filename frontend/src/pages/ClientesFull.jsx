import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesFull.css';
import { API, authHeaders } from '../config/api';

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

// Máscara de CPF (só números; 000.000.000-00)
function formatCPF(input) {
  const nums = String(input || '').replace(/\D/g, '').slice(0, 11);
  let out = nums;
  if (nums.length > 9) out = `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9,11)}`;
  else if (nums.length > 6) out = `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6)}`;
  else if (nums.length > 3) out = `${nums.slice(0,3)}.${nums.slice(3)}`;
  return out;
}

// Máscara de telefone BR (só números; (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX)
function formatTelefone(input) {
  const d = String(input || '').replace(/\D/g, '').slice(0, 11); // até 11 dígitos
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; // 8 ou 9? ajusta abaixo
  // 11 dígitos (celular)
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
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
    if (campo === 'idade') {
      const soDigitos = String(valor).replace(/\D/g, '').slice(0, 2); // 0–99
      setForm(prev => ({ ...prev, idade: soDigitos }));
      return;
    }
    if (campo === 'cpf') {
      setForm(prev => ({ ...prev, cpf: formatCPF(valor) }));
      return;
    }
    if (campo === 'telefone') {
      setForm(prev => ({ ...prev, telefone: formatTelefone(valor) }));
      return;
    }
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Nome obrigatório; CPF/Telefone opcionais
    if (!form.nome || !form.nome.trim()) return alert('O Nome é obrigatório.');

    // CPF: se preenchido, validar
    const cpfTrim = (form.cpf || '').trim();
    const cpfNumeros = cpfTrim.replace(/\D/g, '');
    if (cpfNumeros.length > 0 && !validaCPF(cpfTrim)) {
      return alert('CPF inválido. Verifique e tente novamente.');
    }

    // Telefone: se preenchido, precisa ter 10 ou 11 dígitos (fixo/celular)
    const telTrim = (form.telefone || '').trim();
    const telNums = telTrim.replace(/\D/g, '');
    if (telNums.length > 0 && (telNums.length < 10 || telNums.length > 11)) {
      return alert('Telefone inválido. Use DDD + número (10 ou 11 dígitos).');
    }

    const body = { ...form };

    // idade: número ou null
    if (body.idade === '' || body.idade === null || body.idade === undefined) {
      body.idade = null;
    } else {
      const n = Number(body.idade);
      if (Number.isNaN(n)) return alert('Idade inválida.');
      body.idade = n;
    }

    // CPF: null se vazio; senão, envia com máscara (ou troque por cpfNumeros se preferir só dígitos)
    body.cpf = cpfNumeros.length ? cpfTrim : null;

    // Telefone: envia com máscara mesmo (se preferir só dígitos, mude para telNums)
    body.telefone = telNums.length ? telTrim : null;

    // booleanos reais
    for (const k of booleanFields) {
      body[k] = String(form[k]) === 'true';
    }

    // trim nos textos
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
      const erroTxt = String(dados?.erro || dados?.message || '').toLowerCase();

      if (resposta.ok) {
        alert('Cliente cadastrado com sucesso!');
        navigate('/dashboard');
      } else {
        // mensagem amigável para CPF duplicado
        if (
          [400, 409, 422].includes(resposta.status) &&
          (erroTxt.includes('cpf') ||
           erroTxt.includes('duplic') ||
           erroTxt.includes('unique') ||
           erroTxt.includes('constraint'))
        ) {
          alert('⚠️ CPF já cadastrado.');
        } else {
          alert(dados?.erro || 'Erro ao cadastrar cliente');
        }
      }
    } catch {
      alert('Erro de conexão com o servidor');
    }
  };

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
                type="text"
                {...(campo === 'idade'
                  ? { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2, placeholder: '0–99' }
                  : campo === 'cpf'
                  ? { inputMode: 'numeric', maxLength: 14, placeholder: '000.000.000-00' }
                  : campo === 'telefone'
                  ? { inputMode: 'tel', maxLength: 16, placeholder: '(42) 9 9999-9999' }
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
