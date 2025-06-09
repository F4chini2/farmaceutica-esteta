import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CadastrarBoleto.css";

function CadastrarBoleto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numero, setNumero] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [arquivo, setArquivo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("numero", numero);
    formData.append("valor", valor);
    formData.append("vencimento", vencimento);
    formData.append("observacoes", observacoes);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      const resp = await fetch(`http://localhost:3001/boletos/fornecedor/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok) {
        alert("Boleto cadastrado com sucesso!");
        navigate("/boletos");
      } else {
        alert(data.erro || "Erro ao cadastrar boleto");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="cadastro-boleto-container">
      <h2>📄 Cadastrar Boleto</h2>
      <form onSubmit={handleSubmit} className="form-boleto">
        <label>Número do Boleto:
          <input value={numero} onChange={(e) => setNumero(e.target.value)} required />
        </label>
        <label>Valor (R$):
          <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        </label>
        <label>Vencimento:
          <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
        </label>
        <label>Observações:
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </label>
        <label>Arquivo PDF:
          <input type="file" accept=".pdf" onChange={(e) => setArquivo(e.target.files[0])} />
        </label>
        <button type="submit">💾 Cadastrar Boleto</button>
      </form>
    </div>
  );
}

export default CadastrarBoleto;
