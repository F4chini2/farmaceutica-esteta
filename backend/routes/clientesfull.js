const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Campos permitidos (nome das chaves no body = colunas no banco)
const FIELDS = [
  'nome', 'telefone', 'alergias', 'descricao', 'idade', 'cpf', 'endereco', 'instagram',
  'motivo_avaliacao', 'tratamento_anterior', 'alergia_medicamento', 'uso_medicamento',
  'usa_filtro_solar', 'usa_acido_peeling', 'problema_pele', 'gravida',
  'cor_pele', 'biotipo_pele', 'hidratacao', 'acne', 'textura_pele',
  'envelhecimento', 'rugas', 'procedimentos', 'autoriza_fotos'
];

const BOOL_FIELDS = new Set(['usa_filtro_solar', 'usa_acido_peeling', 'gravida', 'autoriza_fotos']);

// -------- helpers ----------
function normalizeBody(raw = {}) {
  const out = {};
  for (const k of FIELDS) out[k] = raw[k] ?? null;

  // booleans: aceita true/false, 'true'/'false', 1/0
  for (const k of BOOL_FIELDS) {
    if (out[k] === null) continue;
    const v = out[k];
    if (typeof v === 'boolean') {
      // ok
    } else if (typeof v === 'string') {
      out[k] = v.toLowerCase() === 'true';
    } else if (typeof v === 'number') {
      out[k] = v === 1;
    } else {
      out[k] = false;
    }
  }

  // idade: TEXT (trim) ou null
  if (out.idade !== null) {
    const rawIdade = String(out.idade).trim();
    out.idade = rawIdade === '' ? null : rawIdade; // mantém como texto
  }

  // trims básicos
  if (typeof out.nome === 'string') out.nome = out.nome.trim();
  if (typeof out.cpf === 'string') out.cpf = out.cpf.trim();

  return out;
}

async function clienteTemAgendamentos(id) {
  const r = await pool.query('SELECT COUNT(*) FROM agendamentos WHERE cliente_id = $1', [id]);
  return parseInt(r.rows[0].count, 10) > 0;
}
// ---------------------------

// Cadastrar um novo cliente
router.post('/', autenticarToken, async (req, res) => {
  try {
    const data = normalizeBody(req.body);

    if (!data.nome) {
      return res.status(400).json({ erro: 'nome são obrigatórios' });
    }

    const vals = [
      data.nome, data.telefone, data.alergias, data.descricao, data.idade,
      data.cpf, data.endereco, data.instagram,
      data.motivo_avaliacao, data.tratamento_anterior, data.alergia_medicamento, data.uso_medicamento,
      data.usa_filtro_solar, data.usa_acido_peeling, data.problema_pele, data.gravida,
      data.cor_pele, data.biotipo_pele, data.hidratacao, data.acne, data.textura_pele,
      data.envelhecimento, data.rugas, data.procedimentos, data.autoriza_fotos
    ];

    const { rows } = await pool.query(
      `INSERT INTO clientes (
        nome, telefone, alergias, descricao, idade, cpf, endereco, instagram,
        motivo_avaliacao, tratamento_anterior, alergia_medicamento, uso_medicamento,
        usa_filtro_solar, usa_acido_peeling, problema_pele, gravida,
        cor_pele, biotipo_pele, hidratacao, acne, textura_pele,
        envelhecimento, rugas, procedimentos, autoriza_fotos
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      )
      RETURNING *`,
      vals
    );

    return res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Erro ao cadastrar cliente:', e);
    return res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
  }
});

// Atualizar cliente (parcial) por ID
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    // normaliza, mas preserva null vs não enviado
    let incoming = normalizeBody(req.body);

    // monta update dinâmico somente com campos presentes no body original
    const setParts = [];
    const values = [];
    let idx = 1;

    for (const k of FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        setParts.push(`${k} = $${idx++}`);
        values.push(incoming[k]);
      }
    }

    if (setParts.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    values.push(id); // where id
    const sql = `UPDATE clientes SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`;

    const result = await pool.query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    return res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!', cliente: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
  }
});

// Listar todos os clientes
router.get('/', autenticarToken, async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM clientes ORDER BY id');
    return res.status(200).json(r.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    return res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// Buscar cliente por ID
router.get('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    return res.status(200).json(r.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    return res.status(500).json({ erro: 'Erro ao buscar cliente.' });
  }
});

// Excluir cliente por ID (somente admin e sem agendamentos)
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    if (await clienteTemAgendamentos(id)) {
      return res.status(400).json({ erro: 'Não é possível excluir cliente com agendamentos vinculados.' });
    }

    const r = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    return res.status(200).json({ mensagem: 'Cliente removido com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    return res.status(500).json({ erro: 'Erro ao deletar cliente.' });
  }
});

module.exports = router;
