
import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';

function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3001/clientesfull', {
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

  const excluirCliente = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este cliente?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Cliente excluído com sucesso!');
        setClientes((clientesAtuais) => clientesAtuais.filter(c => c.id !== id));
      } else {
        alert(dados.erro || 'Erro ao excluir cliente');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>🛍️ Clientes</h1>
        <button className="btn-primary" onClick={() => navigate('/clientesfull')}>
          ➕ Novo Cliente
        </button>
      </div>
      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar cliente por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <div className="clientes-lista">
        {clientes
          .filter(cliente => cliente.nome.toLowerCase().includes(busca.toLowerCase()))
          .map((cliente) => (
            <div key={cliente.id} className="card">
              <p><strong>👤 Nome:</strong> {cliente.nome}</p>
              <p><strong>📞 Telefone:</strong> {cliente.telefone}</p>
              <p><strong>⚠ Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>
              <button className="btn-secondary" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                🔍Detalhes
              </button>
              <button className="btn-primary" onClick={() => navigate(`/clientes/${cliente.id}/agendar`)}>
                📅Agendar
              </button>
              <button className="btn-danger" onClick={() => excluirCliente(cliente.id)}>
                🗑️Excluir
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
