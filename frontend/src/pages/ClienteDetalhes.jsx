import './ClienteDetalhes.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const buscarCliente = async () => {
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
        } else {
          alert(dados.erro || 'Erro ao buscar cliente');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao conectar com o servidor');
      }
    };

    buscarCliente();
  }, [id]);

  if (!cliente) return <p>Carregando...</p>;

  return (
    <div className="detalhes-container">
      <div className="detalhes-card">
        <h2>Detalhes do Cliente</h2>
        <p><strong>🧍 Nome:</strong> {cliente.nome}</p>
        <p><strong>📞 Telefone:</strong> {cliente.telefone}</p>
        <p><strong>⚠ Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>
        <button onClick={() => navigate('/dashboard')}>⬅ Voltar</button>
      </div>
    </div>
  );
}

export default ClienteDetalhes;
