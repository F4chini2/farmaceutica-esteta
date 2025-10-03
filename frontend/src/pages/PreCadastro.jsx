import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreCadastro.css'; // aqui você cola o CSS baseado no boletos

export default function PreCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    procedimentos: '',
    autoriza_fotos: 'false',
  });
  const [status, setStatus] = useState(null);

  const handleChange = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const resp = await fetch('http://localhost:3001/pre-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          autoriza_fotos: form.autoriza_fotos === 'true',
        }),
      });

      const data = await resp.json();
      if (resp.ok) {
        setStatus({ tipo: 'ok', msg: 'Pré-cadastro enviado com sucesso!' });
        setForm({ nome: '', endereco: '', telefone: '', procedimentos: '', autoriza_fotos: 'false' });
      } else {
        setStatus({ tipo: 'erro', msg: data.erro || 'Erro ao enviar.' });
      }
    } catch {
      setStatus({ tipo: 'erro', msg: 'Falha de conexão.' });
    }
  };

  return (
    <div className="precadastro-container">
      <h2>📝 Pré-cadastro</h2>

      <form onSubmit={handleSubmit} className="form-precadastro">
        <label>
          Nome:
          <input type="text" value={form.nome} onChange={e => handleChange('nome', e.target.value)} required />
        </label>

        <label>
          Endereço:
          <input type="text" value={form.endereco} onChange={e => handleChange('endereco', e.target.value)} />
        </label>

        <label>
          Telefone:
          <input type="tel" value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} placeholder="(00) 00000-0000" />
        </label>

        <label>
          Procedimentos:
          <input type="text" value={form.procedimentos} onChange={e => handleChange('procedimentos', e.target.value)} placeholder="Ex.: limpeza de pele, peeling..." />
        </label>

        <label>
          Autoriza Fotos:
          <select value={form.autoriza_fotos} onChange={e => handleChange('autoriza_fotos', e.target.value)}>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        </label>

        <button type="submit" className="btn-primary">📝 Enviar</button>
      </form>

      {status && (
        <p style={{ marginTop: 12, color: status.tipo === 'ok' ? 'green' : 'crimson' }}>
          {status.msg}
        </p>
      )}
    </div>
  );
}
