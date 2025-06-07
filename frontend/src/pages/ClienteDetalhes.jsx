import './ClienteDetalhes.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState({
    data: '',
    horario: '',
    servico: '',
    observacoes: ''
  });
  const [servicos, setServicos] = useState([
    'Limpeza de pele',
    'Peeling químico',
    'Microagulhamento'
  ]);
  const [novoServico, setNovoServico] = useState('');

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3001/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (resposta.ok) setCliente(dados);
        else alert(dados.erro || 'Erro ao carregar cliente');
      } catch (err) {
        alert('Erro ao conectar com o servidor');
      }
    };

    fetchCliente();
  }, [id]);

  const handleAgendamento = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3001/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cliente_id: id,
          ...form
        })
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        alert('Agendamento criado com sucesso!');
        setForm({ data: '', horario: '', servico: '', observacoes: '' });
      } else {
        alert(dados.erro || 'Erro ao agendar');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const adicionarNovoServico = () => {
    if (novoServico.trim() && !servicos.includes(novoServico)) {
      setServicos([...servicos, novoServico]);
      setNovoServico('');
    }
  };

  if (!cliente) return <p>Carregando cliente...</p>;

  return (
    <div className="detalhes-container">
      <button onClick={() => navigate('/dashboard')} className="btn-voltar">
        ⬅ Voltar para Clientes
      </button>

      <h2>Detalhes de {cliente.nome}</h2>
      <p className="descricao-cliente">
        <strong>Telefone:</strong> {cliente.telefone}
      </p>
      <p className="descricao-cliente">
        <strong>Alergias:</strong> {cliente.alergias || 'Nenhuma'}
      </p>
      <p className="descricao-cliente">
        <strong>Descrição:</strong> {cliente.descricao || 'Nenhuma'}
      </p>

     <div className="editar-descricao">
  <textarea
    placeholder="Atualizar descrição do cliente"
    value={cliente.descricao}
    onChange={(e) =>
      setCliente({ ...cliente, descricao: e.target.value })
    }
  />
  <button
    onClick={async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3001/clientes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...cliente,
            descricao: cliente.descricao,
          }),
        });
        const dados = await resposta.json();
        if (resposta.ok) alert('Descrição atualizada!');
        else alert(dados.erro || 'Erro ao atualizar');
      } catch (err) {
        alert('Erro de conexão');
      }
    }}
  >
    💾 Salvar Descrição
  </button>
</div>

      <h3>➕ Novo Agendamento</h3>
      <form onSubmit={handleAgendamento} className="form-agendamento">
        <input
          type="date"
          value={form.data}
          onChange={e => setForm({ ...form, data: e.target.value })}
          required
        />
        <input
          type="time"
          value={form.horario}
          onChange={e => setForm({ ...form, horario: e.target.value })}
          required
        />
        <select
          value={form.servico}
          onChange={e => setForm({ ...form, servico: e.target.value })}
          required
        >
          <option value="">Selecione um serviço</option>
          {servicos.map((s, index) => (
            <option key={index} value={s}>{s}</option>
          ))}
        </select>
        <div className="novo-servico-linha">
          <input
            type="text"
            placeholder="Novo serviço (opcional)"
            value={novoServico}
            onChange={e => setNovoServico(e.target.value)}
          />
          <button type="button" onClick={adicionarNovoServico}>➕</button>
        </div>
        <textarea
          placeholder="Observações"
          value={form.observacoes}
          onChange={e => setForm({ ...form, observacoes: e.target.value })}
        />
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}

export default ClienteDetalhes;
