import { useEffect, useState } from 'react';
import './Agendamentos.css';
import Tabs from '../components/Tabs';
import { API, authHeaders } from '../config/api';

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const resposta = await fetch(`${API}/agendamentos`, {
          headers: authHeaders()
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          setAgendamentos(dados);
        } else {
          alert(dados.erro || 'Erro ao buscar agendamentos');
        }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      }
    };
    fetchAgendamentos();
  }, []);

  const filtrados = agendamentos.filter((ag) =>
    ((ag?.nome_cliente) || '').toLowerCase().includes(busca.toLowerCase()) ||
    ((ag?.procedimento) || '').toLowerCase().includes(busca.toLowerCase())
  );

  const ordenados = [...filtrados].sort((a, b) => {
    const da = a?.data_hora ? new Date(a.data_hora).getTime() : 0;
    const db = b?.data_hora ? new Date(b.data_hora).getTime() : 0;
    return db - da || (b?.id || 0) - (a?.id || 0);
  });

  return (
    <div className="agendamentos-container">
      <Tabs />
      <h2>📅 Agendamentos</h2>
      <input
        type="text"
        placeholder="Buscar por cliente ou procedimento..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="input-busca"
      />
      <div className="agendamentos-lista">
        {ordenados.map((ag) => (
          <div key={ag.id} className="card-agendamento">
            <p><strong>👤 Cliente:</strong> {ag.nome_cliente}</p>
            <p><strong>🗓 Data:</strong> {ag?.data_hora ? new Date(ag.data_hora).toLocaleDateString() : '-'}</p>
            <p><strong>⏰ Horário:</strong> {ag?.data_hora ? new Date(ag.data_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}</p>
            <p><strong>💼 Procedimento:</strong> {ag.procedimento}</p>
            <p><strong>📝 Observações:</strong> {ag.observacoes || 'Nenhuma'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Agendamentos;
