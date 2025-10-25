import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CadastrarBoletos.css";
import { API, authHeaders } from "../config/api";

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

    const formData = new FormData();
    formData.append("fornecedor_id", id);
    formData.append("numero", numero);
    formData.append("valor", valor);
    formData.append("vencimento", vencimento);
    formData.append("observacoes", observacoes);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      const resp = await fetch(`${API}/boletos`, {
        method: "POST",
        headers: { ...authHeaders() }, // NÃO definir Content-Type com FormData
        body: formData,
      });
      const data = await resp.json();

      if (resp.ok) {
        alert("Boleto cadastrado com sucesso!");
        navigate("/boletos");
      } else {
        alert(data?.erro || "Erro ao cadastrar boleto");
      }
    } catch {
      alert("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="cadastro-boleto-container">
      <button className="btn-voltar" onClick={() => navigate(-1)}>
        ⬅ Voltar
      </button>
      <h2>📄 Cadastrar Boleto</h2>

      <form onSubmit={handleSubmit} className="form-boleto">
        <label>
          Número do Boleto:
          <input value={numero} onChange={(e) => setNumero(e.target.value)}/>
        </label>

        <label>
          Valor (R$):
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
        </label>

        <label>
          Vencimento:
          <input
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            required
          />
        </label>

        <label>
          Observações:
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </label>

        <div className="upload-wrapper">
          <span>📎 Arquivo (PDF/JPG/PNG):</span>
          <label className="custom-file-upload">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            />
            Escolher arquivo
          </label>
          {arquivo && <span>{arquivo.name}</span>}
        </div>

        <button type="submit" className="btn-primary">💾 Cadastrar Boleto</button>
      </form>
    </div>
  );
}

export default CadastrarBoleto;
