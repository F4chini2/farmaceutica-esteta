import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/Tabs';
import { Pagination } from '../styles/Global';
import { API, authHeaders } from '../config/api';

function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const resposta = await fetch(`${API}/clientesfull`, {
          headers: { ...authHeaders() }
        });
        const dados = await resposta.json();
        if (resposta.ok) setClientes(dados);
        else alert(dados?.erro || 'Erro ao buscar clientes');
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
      const resposta = await fetch(`${API}/clientesfull/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        alert('Cliente excluído com sucesso!');
        setClientes((lista) => lista.filter((c) => c.id !== id));
      } else {
        alert(dados?.erro || 'Erro ao excluir cliente');
      }
    } catch {
      alert('Erro ao conectar com o servidor');
    }
  };

  // ===== PAGINAÇÃO (6 por página) =====
  const pageSize = 6;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [busca, clientes]);

  // Helper: remove tudo que não for dígito (para comparar CPF/telefone)
  const apenasDigitos = (str = '') => (str + '').replace(/\D/g, '');

  // Filtro: busca por nome (texto) ou por CPF/telefone (números parciais)
  const filtrados = clientes.filter((cliente) => {
    if (!busca) return true;
    const termo = busca.trim().toLowerCase();
    const termoDig = apenasDigitos(termo);

    // nome
    const nome = (cliente?.nome || '').toLowerCase();
    if (nome.includes(termo)) return true;

    // cpf
    const cpf = apenasDigitos(cliente?.cpf || '');
    if (termoDig && cpf.includes(termoDig)) return true;

    // telefone
    const tel = apenasDigitos(cliente?.telefone || '');
    if (termoDig && tel.includes(termoDig)) return true;

    return false;
  });

  const ordenados = [...filtrados].sort((a, b) =>
  (a?.nome || '').localeCompare(b?.nome || '', 'pt-BR', { sensitivity: 'base' })
  );


  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const visiveis = ordenados.slice(startIdx, startIdx + pageSize);
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
        placeholder="🔍 Buscar por nome, CPF ou Contato..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {visiveis.map((cliente) => (
          <div key={cliente.id} className="card">
            <p><strong>👤 Nome:</strong> {cliente.nome}</p>
            <p><strong>📞 Contato:</strong> {cliente.telefone || '-'}</p>
            <p><strong>🆔 CPF:</strong> {cliente.cpf || '-'}</p>

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

        {ordenados.length === 0 && (
          <div className="card vazio">Nenhum cliente encontrado para a busca.</div>
        )}
      </div>

      {/* Paginação só quando existir item */}
      {ordenados.length > 0 && (
        <Pagination page={page} total={totalPages} onPage={setPage} />
      )}
    </div>
  );
}

export default Dashboard;
