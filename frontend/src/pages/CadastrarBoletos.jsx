import React, { useState, useEffect } from "react";
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [erroArquivo, setErroArquivo] = useState("");

  // limpa URL do preview quando trocar arquivo/desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleArquivoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setErroArquivo("");
    setArquivo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!file) return;

    // Tipos permitidos
    const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];
    if (!tiposPermitidos.includes(file.type)) {
      setErroArquivo("Tipo de arquivo não suportado. Envie PDF, JPG ou PNG.");
      return;
    }

    // Limite de tamanho (opcional): 10 MB
    const limiteBytes = 10 * 1024 * 1024;
    if (file.size > limiteBytes) {
      setErroArquivo("Arquivo maior que 10MB.");
      return;
    }

    setArquivo(file);

    // Gera preview somente para imagens
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fornecedor_id", id);
    formData.append("numero", numero);        // opcional
    formData.append("valor", valor);
    formData.append("vencimento", vencimento);
    formData.append("observacoes", observacoes);
    if (arquivo) formData.append("arquivo", arquivo);

    try {
      const resp = await fetch(`${API}/boletos`, {
        method: "POST",
        headers: { ...authHeaders() }, // não setar Content-Type manualmente
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
      <button className="btn-voltar" onClick={() => navigate(-1)}>⬅ Voltar</button>
      <h2>📄 Cadastrar Boleto</h2>

      <form onSubmit={handleSubmit} className="form-boleto">
        <label>
          Número do Boleto:
          <input value={numero} onChange={(e) => setNumero(e.target.value)} />
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
              onChange={handleArquivoChange}
            />
            Escolher arquivo
          </label>
          {arquivo && <span>{arquivo.name}</span>}
          {erroArquivo && <small style={{color:"#b00020"}}>{erroArquivo}</small>}
        </div>

        {/* Preview somente para imagem */}
        {previewUrl && (
          <div style={{gridColumn:"span 2", textAlign:"center"}}>
            <img
              src={previewUrl}
              alt="Pré-visualização"
              style={{maxWidth:"100%", maxHeight:280, borderRadius:12, boxShadow:"0 2px 10px rgba(0,0,0,.08)"}}
            />
          </div>
        )}

        <button type="submit" className="btn-primary">💾 Cadastrar Boleto</button>
      </form>
    </div>
  );
}

export default CadastrarBoleto;
