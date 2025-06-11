
import './ClienteDetalhes.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
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

  if (!cliente) return <p>Carregando cliente...</p>;

  return (
    <div className="container-box">
      <button onClick={() => navigate('/dashboard')} className="btn-voltar">
        ⬅ Voltar para Clientes
      </button>

      <h2>Detalhes de {cliente.nome}</h2>

      <div className="descricao-cliente">
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        <p><strong>Alergias:</strong> {cliente.alergias || 'Nenhuma'}</p>
        <p><strong>Idade:</strong> {cliente.idade || 'Não informado'}</p>
        <p><strong>Endereço:</strong> {cliente.endereco || 'Não informado'}</p>
        <p><strong>Instagram:</strong> {cliente.instagram || 'Não informado'}</p>
        <p><strong>Motivo da Avaliação:</strong> {cliente.motivo_avaliacao || 'Não informado'}</p>
        <p><strong>Tratamento Anterior:</strong> {cliente.tratamento_anterior || 'Nenhum'}</p>
        <p><strong>Alergia a Medicamento:</strong> {cliente.alergia_medicamento || 'Não'}</p>
        <p><strong>Uso de Medicamento:</strong> {cliente.uso_medicamento || 'Não'}</p>
        <p><strong>Usa Filtro Solar:</strong> {cliente.usa_filtro_solar ? 'Sim' : 'Não'}</p>
        <p><strong>Usa Ácido/Peeling:</strong> {cliente.usa_acido_peeling ? 'Sim' : 'Não'}</p>
        <p><strong>Problemas de Pele:</strong> {cliente.problema_pele || 'Não informado'}</p>
        <p><strong>Grávida:</strong> {cliente.gravida ? 'Sim' : 'Não'}</p>
        <p><strong>Cor da Pele:</strong> {cliente.cor_pele || 'Não informado'}</p>
        <p><strong>Biotipo de Pele:</strong> {cliente.biotipo_pele || 'Não informado'}</p>
        <p><strong>Hidratação:</strong> {cliente.hidratacao || 'Não informado'}</p>
        <p><strong>Acne:</strong> {cliente.acne || 'Não informado'}</p>
        <p><strong>Textura da Pele:</strong> {cliente.textura_pele || 'Não informado'}</p>
        <p><strong>Envelhecimento:</strong> {cliente.envelhecimento || 'Não informado'}</p>
        <p><strong>Rugas:</strong> {cliente.rugas || 'Não informado'}</p>
        <p><strong>CPF:</strong> {cliente.cpf || 'Não informado'}</p>
        <p><strong>Descrição:</strong> {cliente.descricao || 'Nenhuma'}</p>
      </div>

      <div className="editar-descricao">
        <textarea
          placeholder="Atualizar descrição do cliente"
          value={cliente.descricao}
          onChange={(e) =>
            setCliente({ ...cliente, descricao: e.target.value })
          }
        />
        <button
          className="btn-primary"
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              const resposta = await fetch(`http://localhost:3001/clientesfull/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...cliente, descricao: cliente.descricao }),
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
    </div>
  );
}

export default ClienteDetalhes;
