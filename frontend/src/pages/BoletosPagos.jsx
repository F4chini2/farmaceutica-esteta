
import './Boletos.css';
import './Historico.css'; // Para zoom e overlay
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';

function BoletosPagos() {
  const [boletos, setBoletos] = useState([]);
  const [busca, setBusca] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    const fetchBoletos = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/boletos/pagos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBoletos(data);
    };
    fetchBoletos();
  }, []);

  const excluirBoleto = async (id) => {
    if (!window.confirm('Deseja excluir este boleto pago?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/boletos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setBoletos(prev => prev.filter(b => b.id !== id));
  };

  const boletosFiltrados = boletos.filter(b =>
    b.nome_fornecedor.toLowerCase().includes(busca.toLowerCase()) ||
    b.numero.toLowerCase().includes(busca.toLowerCase()) ||
    String(b.valor).includes(busca) ||
    b.vencimento.includes(busca)
  );

  return (
    <div className="dashboard-container">
      <Tabs />
      <h1>✅ Boletos Pagos</h1>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por fornecedor, número, valor ou vencimento..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {boletosFiltrados.map(b => (
          <div key={b.id} className="card">
            <p><strong>Fornecedor:</strong> {b.nome_fornecedor}</p>
            <p><strong>Número:</strong> {b.numero}</p>
            <p><strong>Valor:</strong> R$ {b.valor}</p>
            <p><strong>Vencimento:</strong> {new Date(b.vencimento).toLocaleDateString()}</p>
            <p><strong>Observações:</strong> {b.observacoes || 'Nenhuma'}</p>

            {b.arquivo && (
              b.arquivo.endsWith('.pdf') ? (
                <a href={`http://localhost:3001${b.arquivo}`} target="_blank" rel="noopener noreferrer">
                  📄 Ver PDF
                </a>
              ) : (
                <img
                  src={`http://localhost:3001${b.arquivo}`}
                  alt="arquivo"
                  className="foto-procedimento"
                  onClick={() => setImagemSelecionada(`http://localhost:3001${b.arquivo}`)}
                />
              )
            )}

            <button className="btn-danger" onClick={() => excluirBoleto(b.id)}>🗑️ Excluir</button>
          </div>
        ))}
      </div>

      {imagemSelecionada && (
        <div className="overlay" onClick={() => setImagemSelecionada(null)}>
          <img src={imagemSelecionada} alt="Visualização" className="imagem-grande" />
        </div>
      )}
    </div>
  );
}

export default BoletosPagos;
