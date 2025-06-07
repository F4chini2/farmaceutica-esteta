import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteDetalhes from './pages/ClienteDetalhes';

<Route
  path="/clientes/:id"
  element={token ? <ClienteDetalhes /> : <Navigate to="/" />}
/>

const navigate = useNavigate();

<button onClick={() => navigate(`/clientes/${cliente.id}`)}>
  🔍 Ver Detalhes
</button>

function Dashboard() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3001/clientes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const dados = await resposta.json();
        if (resposta.ok) {
          setClientes(dados);
        } else {
          alert(dados.erro || 'Erro ao buscar clientes');
        }
      } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao conectar com o servidor');
      }
    };

    fetchClientes();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Clientes</h1>
      <div className="clientes-lista">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="cliente-card">
            <p><strong>🧍 Nome:</strong> {cliente.nome}</p>
            <p><strong>📞 Telefone:</strong> {cliente.telefone}</p>
            <p><strong>⚠ Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>
            <button onClick={() => alert('Função de detalhes em breve')}>🔍 Ver Detalhes</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
