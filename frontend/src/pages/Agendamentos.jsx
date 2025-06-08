import { useEffect, useState } from 'react';
import './Agendamentos.css';
import Tabs from '../components/Tabs';

function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3001/agendamentos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (resposta.ok) {
          setAgendamentos(dados);
        } else {
          alert(dados.erro || 'Erro ao buscar agendamentos');
        }
      } catch (err) {
        alert('Erro ao conectar com o servidor');
      }
    };

    fetchAgendamentos();
  }, []);

  return (
    <div className="agendamentos-container">
      <Tabs />
      <div className="topo-agendamentos">
        <h1>📅 Agendamentos</h1>
      </div>
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <div className="lista-agendamentos">
          {agendamentos.map((ag) => (
            <div key={ag.id} className="card-agendamento">
              <p><strong>👤 Cliente:</strong> {ag.nome_cliente}</p>
              <p><strong>🗓 Data:</strong> {new Date(ag.data).toLocaleDateString()}</p>
              <p><strong>⏰ Horário:</strong> {ag.horario?.slice(0, 5)}</p>
              <p><strong>💆 Serviço:</strong> {ag.servico}</p>
              <p><strong>📝 Observações:</strong> {ag.observacoes || 'Nenhuma'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Agendamentos;
