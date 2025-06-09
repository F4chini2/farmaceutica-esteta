
import './BoletosPagos.css';
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';

function BoletosPagos() {
  const [boletos, setBoletos] = useState([]);

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

  return (
    <div className="dashboard-container">
      <Tabs />
      <h1>✅ Boletos Pagos</h1>
      <div className="clientes-lista">
        {boletos.map(b => (
          <div key={b.id} className="cliente-card">
            <p><strong>Fornecedor:</strong> {b.nome_fornecedor}</p>
            <p><strong>Número:</strong> {b.numero}</p>
            <p><strong>Valor:</strong> R$ {b.valor}</p>
            <p><strong>Vencimento:</strong> {new Date(b.vencimento).toLocaleDateString()}</p>
            <p><strong>Observações:</strong> {b.observacoes || 'Nenhuma'}</p>
            <button onClick={() => excluirBoleto(b.id)}>🗑️ Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoletosPagos;
