import './ClienteDetalhes.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const booleanFields = new Set(['gravida','autoriza_fotos','usa_filtro_solar','usa_acido_peeling']);

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          // Converte booleans para 'true'/'false' para os selects
          const norm = { ...dados };
          booleanFields.forEach((k) => {
            if (k in norm) norm[k] = String(Boolean(norm[k]));
          });
          setForm(norm);
        } else {
          alert(dados.erro || 'Erro ao carregar cliente');
        }
      } catch (err) {
        alert('Erro ao conectar com o servidor');
      }
    };

    fetchCliente();
  }, [id]);

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const body = { ...form };
      // Converte 'true'/'false' em boolean para API
      booleanFields.forEach((k) => {
        if (k in body) body[k] = body[k] === 'true';
      });
      if (body.idade === '') body.idade = null;

      const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const dados = await resposta.json();
      if (resposta.ok) alert('Dados do cliente atualizados!');
      else alert(dados.erro || 'Erro ao atualizar');
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  if (!form) return <p>Carregando cliente...</p>;

  return (
    <div className="container-box">
      <button onClick={() => navigate('/dashboard')} className="btn-voltar">
        ⬅ Voltar para Clientes
      </button>

      <h2>Editar Cliente: {form.nome}</h2>

      <div className="descricao-cliente editar-descricao">
        {Object.entries(form).filter(([k]) => k !== 'id').map(([campo, valor]) => (
          <label key={campo} className="campo-formulario">
            <strong>{campo.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
            {booleanFields.has(campo) ? (
              <select value={valor} onChange={e => handleChange(campo, e.target.value)}>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            ) : (
              <input
                value={valor ?? ''}
                onChange={e => handleChange(campo, e.target.value)}
                type={campo === 'idade' ? 'number' : 'text'}
              />
            )}
          </label>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSave}>
        💾 Salvar Alterações
      </button>
    </div>
  );
}

export default ClienteDetalhes;
