import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, authHeaders } from "../config/api";
import "./UsuariosFull.css"; // usa somente o CSS desta tela

export default function UsuariosFull() {
  const navigate = useNavigate();

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Form
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("comum"); // 'comum' | 'admin'

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch(`${API}/usuarios`, { headers: { ...authHeaders() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Falha ao carregar");
      setLista(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) { alert("Informe e-mail e senha."); return; }
    try {
      const resp = await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ email, senha, nome, telefone, descricao, tipo })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.erro || "Erro ao criar usuário");
      setEmail(""); setSenha(""); setNome(""); setTelefone(""); setDescricao(""); setTipo("comum");
      await carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  async function tornarAdmin(id, flag) {
    try {
      const res = await fetch(`${API}/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ tipo: flag ? "admin" : "comum" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Erro ao atualizar perfil");
      await carregar();
    } catch (e) { alert(e.message); }
  }

  async function remover(id) {
    if (!confirm("Remover este usuário?")) return;
    try {
      const res = await fetch(`${API}/usuarios/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() }
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.erro || "Erro ao remover");
      }
      await carregar();
    } catch (e) { alert(e.message); }
  }

  return (
    <div className="usuariosfull">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        ⬅ Voltar
      </button>

      <h2>👥 Usuários</h2>

      {/* FORM — estrutura igual ao CadastrarBoletos (labels envolvendo inputs) */}
      <form onSubmit={handleSubmit}>
        <label>
          E-mail*
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Senha*
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>

        <label>
          Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>

        <label>
          Telefone
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Descrição
          <textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </label>

        <label>
          Perfil
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="comum">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div />
        <button type="submit">💾 Criar usuário</button>
      </form>

      {/* LISTA — mantida simples abaixo, dentro do mesmo “card” visual */}
      <h2 style={{ marginTop: 24 }}>📋 Lista</h2>
      {carregando ? (
        <p>Carregando…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>E-mail</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Nome</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Telefone</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Perfil</th>
                <th style={{ border: "1px solid #ddd", padding: 8 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{u.id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{u.email}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{u.nome || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{u.telefone || "-"}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{u.tipo}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, display: "flex", gap: 8, justifyContent: "center" }}>
                    {u.tipo === "admin" ? (
                      <button onClick={() => tornarAdmin(u.id, false)}>Tornar comum</button>
                    ) : (
                      <button onClick={() => tornarAdmin(u.id, true)}>Tornar admin</button>
                    )}
                    <button onClick={() => remover(u.id)}>Remover</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }} colSpan={6}>
                    Sem registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
