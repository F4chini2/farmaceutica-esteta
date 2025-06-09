import { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import './Fornecedores.css';
import './Historico.css';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState({ nome: '', contato: '', email: '', observacoes: '' });
  const [boletos, setBoletos] = useState({});
  const [busca, setBusca] = useState('');
  const [visualizacoes, setVisualizacoes] = useState({});

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    const token = localStorage.getItem('token');
    const resposta = await fetch('http://localhost:3001/fornecedores', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dados = await resposta.json();
    setFornecedores(dados);
  };

  const cadastrarFornecedor = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const resp = await fetch('http://localhost:3001/fornecedores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      setForm({ nome: '', contato: '', email: '', observacoes: '' });
      carregarFornecedores();
    }
  };

  const cadastrarBoleto = async (e, id) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    const dados = boletos[id];
    formData.append('fornecedor_id', id);
    formData.append('numero', dados.numero);
    formData.append('valor', dados.valor);
    formData.append('vencimento', dados.vencimento);
    formData.append('observacoes', dados.observacoes);
    if (dados.arquivo) formData.append('arquivo', dados.arquivo);

    const resp = await fetch('http://localhost:3001/boletos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (resp.ok) {
      alert('Boleto cadastrado com sucesso!');
      setBoletos(prev => ({ ...prev, [id]: {} }));
    } else {
      alert('Erro ao cadastrar boleto');
    }
  };

  const excluirFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    const token = localStorage.getItem('token');
    const resp = await fetch(`http://localhost:3001/fornecedores/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      setFornecedores(prev => prev.filter(f => f.id !== id));
    } else {
      alert('Erro ao excluir fornecedor');
    }
  };

  return (
    <div className="dashboard-container">
      <Tabs />
      <div className="topo-dashboard">
        <h1>📦 Fornecedores</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por nome, email ou telefone..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="clientes-lista">
        {fornecedores
          .filter(f =>
            f.nome.toLowerCase().includes(busca.toLowerCase()) ||
            f.email.toLowerCase().includes(busca.toLowerCase()) ||
            f.contato.toLowerCase().includes(busca.toLowerCase())
          )
          .map(f => (
            <div key={f.id} className="cliente-card">
              <p><strong>📦 Nome:</strong> {f.nome}</p>
              <p><strong>📞 Contato:</strong> {f.contato}</p>
              <p><strong>📧 Email:</strong> {f.email}</p>
              <p><strong>📝 Observações:</strong> {f.observacoes || 'Nenhuma'}</p>

              <form onSubmit={(e) => cadastrarBoleto(e, f.id)}>
                <input
                  placeholder="Nº do Boleto"
                  value={boletos[f.id]?.numero || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], numero: e.target.value } }))}
                />
                <input
                  placeholder="Valor"
                  type="number"
                  step="0.01"
                  value={boletos[f.id]?.valor || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], valor: e.target.value } }))}
                />
                <input
                  type="date"
                  value={boletos[f.id]?.vencimento || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], vencimento: e.target.value } }))}
                />
                <textarea
                  placeholder="Observações"
                  value={boletos[f.id]?.observacoes || ''}
                  onChange={(e) => setBoletos(prev => ({ ...prev, [f.id]: { ...prev[f.id], observacoes: e.target.value } }))}
                />
                <div className="upload-wrapper">
                  <span>📎 Anexar boleto:</span>
                  <label className="custom-file-upload">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setBoletos(prev => ({
                        ...prev,
                        [f.id]: {
                          ...prev[f.id],
                          arquivo: e.target.files[0],
                          url: URL.createObjectURL(e.target.files[0]),
                          nome: e.target.files[0].name,
                          tipo: e.target.files[0].type
                        }
                      }))}
                    />
                    Escolher arquivo
                  </label>
                </div>
              </form>

              {boletos[f.id]?.url && (
                <div className="fotos-wrapper">
                  <div className="foto-container">
                    {boletos[f.id].tipo === 'application/pdf' ? (
                      <a
                        href={boletos[f.id].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="arquivo-pdf-link"
                      >
                        📄 Ver PDF
                      </a>
                    ) : (
                      <img
                        src={boletos[f.id].url}
                        alt="preview"
                        className="foto-procedimento"
                        onClick={() => setVisualizacoes({ ...visualizacoes, [f.id]: boletos[f.id].url })}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                  </div>
                </div>
              )}
              <button type="submit">💳 Cadastrar Boleto</button>
              <button onClick={() => excluirFornecedor(f.id)}>🗑️ Excluir Fornecedor</button>
            </div>
          ))}
      </div>

      {Object.values(visualizacoes).length > 0 && (
        <div className="overlay" onClick={() => setVisualizacoes({})}>
          <img
            src={Object.values(visualizacoes)[0]}
            alt="visualização"
            className="imagem-grande"
          />
        </div>
      )}
    </div>
  );
}

export default Fornecedores;
