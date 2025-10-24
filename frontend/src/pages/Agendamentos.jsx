import React, { useEffect, useMemo, useState } from "react";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const API_URL =
    import.meta?.env?.VITE_API_URL ||
    process.env.VITE_API_URL ||
    "https://api.farmaceutica-esteta.com.br";

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  // -------- helpers --------
  const norm = (v) => (v ?? "").toString().toLowerCase();
  const fmtData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "-";
  const fmtHora = (h) =>
    h ? String(h).slice(0, 5) : "-";

  // -------- carregar lista --------
  const carregar = async () => {
    try {
      setCarregando(true);
      setErro("");

      const r = await fetch(`${API_URL}/agendamentos`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Erro ${r.status}: ${txt || r.statusText}`);
      }

      const data = await r.json();
      setAgendamentos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErro(e.message || "Falha ao carregar agendamentos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- filtro (cliente, serviço, data, horário) --------
  const filtrados = useMemo(() => {
    const q = norm(busca);
    if (!q) return agendamentos;

    return agendamentos.filter((ag) => {
      const nome = norm(ag.cliente_nome ?? ag.nome_cliente);
      const serv = norm(ag.servico);
      const dataS = ag?.data
        ? norm(new Date(ag.data).toLocaleDateString("pt-BR"))
        : "";
      const horaS = ag?.horario ? norm(String(ag.horario).slice(0, 5)) : "";
      return (
        nome.includes(q) ||
        serv.includes(q) ||
        dataS.includes(q) ||
        horaS.includes(q)
      );
    });
  }, [agendamentos, busca]);

  // -------- ações --------
  const enviarParaHistorico = async (ag) => {
    if (!confirm("Enviar este agendamento para o histórico?")) return;
    try {
      const r = await fetch(`${API_URL}/agendamentos/${ag.id}/historico`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ agendamento_id: ag.id }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Erro ${r.status}: ${txt || r.statusText}`);
      }
      // remove da lista local
      setAgendamentos((prev) => prev.filter((x) => x.id !== ag.id));
    } catch (e) {
      alert(e.message || "Não foi possível enviar para o histórico.");
    }
  };

  const excluir = async (ag) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    try {
      const r = await fetch(`${API_URL}/agendamentos/${ag.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Erro ${r.status}: ${txt || r.statusText}`);
      }
      setAgendamentos((prev) => prev.filter((x) => x.id !== ag.id));
    } catch (e) {
      alert(e.message || "Não foi possível excluir.");
    }
  };

  // -------- UI --------
  return (
    <div className="dashboard-container">
      <div className="topo-agendamentos">
        <h1>📅 Agendamentos</h1>
      </div>

      <input
        className="barra-pesquisa"
        type="text"
        placeholder="🔍 Buscar por cliente, serviço, data ou horário..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "#b84c3f", fontWeight: 600 }}>{erro}</p>}

      <div className="lista-agendamentos">
        {!carregando && filtrados.length === 0 && (
          <div className="card vazio">
            Nenhum agendamento encontrado.
          </div>
        )}

        {filtrados.map((ag) => (
          <div key={ag.id} className="card">
            <p>
              <strong>👤 Cliente:</strong>{" "}
              {ag.cliente_nome ?? ag.nome_cliente ?? "-"}
            </p>
            <p>
              <strong>📅 Data:</strong> {fmtData(ag.data)}
            </p>
            <p>
              <strong>⏰ Horário:</strong> {fmtHora(ag.horario)}
            </p>
            <p>
              <strong>🧴 Serviço:</strong> {ag.servico || "-"}
            </p>
            <p className="observacoes">
              <strong>🗒️ Obs.:</strong>{" "}
              {ag.observacoes ? ag.observacoes : "—"}
            </p>

            <button
              className="btn-secondary"
              onClick={() => enviarParaHistorico(ag)}
            >
              📦 Enviar para Histórico
            </button>
            <button
              className="btn-danger"
              onClick={() => excluir(ag)}
            >
              🗑️ Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
