// src/pages/PreCadastro.jsx
import { useState } from 'react';
import './ClientesFull.css'; // reaproveita o grid e campos

export default function PreCadastro() {
  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    procedimentos: '',
    autoriza_fotos: 'false',
  });
  const [status, setStatus] = useState(null);

  const handleChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!form.nome) return setStatus({ tipo: 'erro', msg: 'Informe o nome.' });

    try {
      const resp = await fetch('http://localhost:3001/pre-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          autoriza_fotos: form.autoriza_fotos === 'true'
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        setStatus({ tipo: 'ok', msg: 'Pré-cadastro enviado! Entraremos em contato.' });
        setForm({ nome: '', endereco: '', telefone: '', procedimentos: '', autoriza_fotos: 'false' });
      } else {
        setStatus({ tipo: 'erro', msg: data.erro || 'Erro ao enviar.' });
      }
    } catch {
      setStatus({ tipo: 'erro', msg: 'Falha de conexão.' });
    }
  };

  return (
    <div className="container-box">
      <h2>Pré-cadastro</h2>
      <form onSubmit={handleSubmit} className="form-agendamento">
        <label className="campo-formulario">
          Nome
          <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} type="text" required />
        </label>

        <label className="campo-formulario">
          Endereço
          <input value={form.endereco} onChange={e => handleChange('endereco', e.target.value)} type="text" />
        </label>

        <label className="campo-formulario">
          Telefone
          <input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} type="tel" placeholder="(00) 00000-0000" />
        </label>

        <label className="campo-formulario">
          Procedimentos
          <input value={form.procedimentos} onChange={e => handleChange('procedimentos', e.target.value)} type="text" placeholder="Ex.: limpeza de pele, peeling..." />
        </label>

        <label className="campo-formulario">
          Autoriza Fotos
          <select value={form.autoriza_fotos} onChange={e => handleChange('autoriza_fotos', e.target.value)}>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        </label>

        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>
          Enviar
        </button>
      </form>

      {status && (
        <p style={{ marginTop: 12, color: status.tipo === 'ok' ? 'green' : 'crimson' }}>
          {status.msg}
        </p>
      )}
    </div>
  );
}
