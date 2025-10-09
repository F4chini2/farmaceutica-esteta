
import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';

function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3001/clientesfull', {
          headers: { Authorization: `Bearer ${token}` }
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
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Cliente excluído com sucesso!');
        setClientes((lista) => lista.filter((c) => c.id !== id));
      } else {
        alert(dados.erro || 'Erro ao excluir cliente');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor');
    }
  };

  // ===== PAGINAÇÃO (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // Sempre volta pra pág. 1 ao mudar busca/lista
  useEffect(() => { setPage(1); }, [busca, clientes]);

  // Filtro + ordenação (novos → antigos; fallback id)
  const filtrados = clientes.filter((cliente) =>
    ((cliente?.nome) || '').toLowerCase().includes(busca.toLowerCase())
  );
  const ordenados = [...filtrados].sort((a, b) => (b?.id || 0) - (a?.id || 0));

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);

  function goTo(p) {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  }
  // ====================================

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
        {visiveis.map((cliente) => (
          <div key={cliente.id} className="card">
            <p><strong>👤 Nome:</strong> {cliente.nome}</p>
            <p><strong>📞 Telefone:</strong> {cliente.telefone || '-'}</p>
            <p><strong>⚠ Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>

            <button
              className="btn-secondary"
              onClick={() => navigate(`/clientes/${cliente.id}`)}
            >
              🔍Detalhes
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate(`/clientes/${cliente.id}/agendar`)}
            >
              📅Agendar
            </button>

            <button
              className="btn-danger"
              onClick={() => excluirCliente(cliente.id)}
            >
              🗑️Excluir
            </button>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="card vazio">Nenhum cliente encontrado para a busca.</div>
        )}
      </div>

      {/* Paginação global (com reticências) */}
      <Pagination page={page} total={totalPages} onPage={setPage} />
    </div>
  );
}

export default Dashboard;
