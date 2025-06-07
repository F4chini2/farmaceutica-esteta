import './ClienteDetalhes.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: '', telefone: '', alergias: '' });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3001/clientes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const dados = await resposta.json();
        if (resposta.ok) {
          setCliente(dados);
          setForm({
            nome: dados.nome,
            telefone: dados.telefone,
            alergias: dados.alergias || ''
          });
        } else {
          alert(dados.erro || 'Erro ao buscar cliente');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao conectar com o servidor');
      }
    };
    fetchCliente();
  }, [id]);

  const handleSalvar = async () => {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3001/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Cliente atualizado com sucesso!');
        setCliente(dados);
        setEditando(false);
      } else {
        alert(dados.erro || 'Erro ao atualizar cliente');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor');
    }
  };

  if (!cliente) return <p>Carregando...</p>;

  return (
    <div className="detalhes-container">
      <h2>Detalhes do Cliente</h2>
      <div className="campo">
        <label>Nome:</label>
        {editando ? (
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        ) : (
          <p>{cliente.nome}</p>
        )}
      </div>

      <div className="campo">
        <label>Telefone:</label>
        {editando ? (
          <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        ) : (
          <p>{cliente.telefone}</p>
        )}
      </div>

      <div className="campo">
        <label>Alergias:</label>
        {editando ? (
          <input value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} />
        ) : (
          <p>{cliente.alergias || 'Nenhuma'}</p>
        )}
      </div>

      <div className="botoes">
        {editando ? (
          <button onClick={handleSalvar}>Salvar</button>
        ) : (
          <button onClick={() => setEditando(true)}>Editar</button>
        )}
        <button onClick={() => navigate('/dashboard')}>Voltar</button>
      </div>
    </div>
  );
}

export default ClienteDetalhes;
