import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs'; // 👈 importa Tabs corretamente

function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate(); // ✅ Coloca aqui DENTRO do componente

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

  const excluirCliente = async (id) => {
  const confirmar = window.confirm('Tem certeza que deseja excluir este cliente?');
  if (!confirmar) return;

  try {
    const token = localStorage.getItem('token');
    const resposta = await fetch(`http://localhost:3001/clientes/${id}`, {
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
    <h1>Clientes</h1>
<button
  className="btn-agendamentos"
  onClick={() => navigate('/dashboard/novo-cliente')}
>
  ➕ Novo Cliente
</button>

    <div className="clientes-lista">
      {clientes.map((cliente) => (
        <div key={cliente.id} className="cliente-card">
          <p><strong>🧍 Nome:</strong> {cliente.nome}</p>
          <p><strong>📞 Telefone:</strong> {cliente.telefone}</p>
          <p><strong>⚠ Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>
          <button onClick={() => navigate(`/clientes/${cliente.id}`)}>🔍 Ver Detalhes</button>
          <button onClick={() => excluirCliente(cliente.id)}>🗑 Excluir</button>

        </div>
      ))}
    </div>
  </div>
);

}

export default Dashboard;
