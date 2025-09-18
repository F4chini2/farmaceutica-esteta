
import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import './ClienteDetalhes.css';
import './Historico.css';

function Historico() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [fotos, setFotos] = useState({});
  const [busca, setBusca] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    const carregarHistorico = async () => {
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:3001/historico/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dados = await resp.json();
      setProcedimentos(dados);

      for (let p of dados) {
        const fotosResp = await fetch(`http://localhost:3001/historico/historico/${p.id}/fotos`);
        const fotosData = await fotosResp.json();
        setFotos(prev => ({ ...prev, [p.id]: fotosData }));
      }
    };

    carregarHistorico();
  }, []);

  const handleFotoUpload = async (e, historicoId) => {
    const formData = new FormData();
    for (let file of e.target.files) {
      formData.append('fotos', file);
    }
    const token = localStorage.getItem('token');
    const resp = await fetch(`http://localhost:3001/historico/historico/${historicoId}/fotos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const dados = await resp.json();
    if (resp.ok) {
      setFotos(prev => ({
        ...prev,
        [historicoId]: [...(prev[historicoId] || []), ...dados.fotos]
      }));
    }
  };

  const deletarHistorico = async (id) => {
    const confirmar = window.confirm("Deseja mesmo excluir este histórico?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:3001/historico/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setProcedimentos(prev => prev.filter(p => p.id !== id));
        setFotos(prev => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
      } else {
        alert("Erro ao excluir histórico.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  };

  const deletarFoto = async (fotoId, historicoId) => {
    const confirmar = window.confirm("Deseja excluir esta foto?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:3001/historico/foto/${fotoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setFotos(prev => ({
          ...prev,
          [historicoId]: prev[historicoId].filter(f => f.id !== fotoId)
        }));
      } else {
        alert("Erro ao excluir a foto.");
      }
    } catch (err) {
      alert("Erro de conexão ao excluir foto.");
    }
  };

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>📂 Histórico</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por cliente ou serviço..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {procedimentos
          .filter(proc =>
            proc.nome_cliente.toLowerCase().includes(busca.toLowerCase()) ||
            proc.servico.toLowerCase().includes(busca.toLowerCase())
          )
          .map(proc => (
            <div key={proc.id} className="card">
              <p><strong>👤 Cliente:</strong> {proc.nome_cliente}</p>
              <p><strong>🗓 Data:</strong> {new Date(proc.data).toLocaleDateString()}</p>
              <p><strong>⏰ Horário:</strong> {proc.horario?.slice(0, 5)}</p>
              <p><strong>💆 Serviço:</strong> {proc.servico}</p>
              <p><strong>📝 Observações:</strong> {proc.observacoes || 'Nenhuma'}</p>

              
              <div className="uploader">
                <span>📸 Enviar fotos:</span>
                <input
                id={`fotos-${proc.id}`}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFotoUpload(e, proc.id)}
                />
                <label className="upload-label" htmlFor={`fotos-${proc.id}`}>
                ⬆️ Escolher arquivos
                </label>
              </div>


                {fotos[proc.id] && fotos[proc.id].length > 0 && (
                <div className="fotos-wrapper">
                  {fotos[proc.id].map(f => (
                    <div className="foto-container" key={f.id}>
                      <button className="btn-excluir-foto" onClick={() => deletarFoto(f.id, proc.id)}>🗑️</button>
                      <img
                        src={`http://localhost:3001${f.url}`}
                        alt="procedimento"
                        className="foto-procedimento"
                        onClick={() => setImagemSelecionada(`http://localhost:3001${f.url}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <button className="btn-danger" onClick={() => deletarHistorico(proc.id)}>🗑️ Excluir</button>

            </div>
          ))}
      </div>

      {imagemSelecionada && (
        <div className="overlay" onClick={() => setImagemSelecionada(null)}>
          <img src={imagemSelecionada} alt="grande" className="imagem-grande" />
        </div>
      )}
    </div>
  );
}

export default Historico;
