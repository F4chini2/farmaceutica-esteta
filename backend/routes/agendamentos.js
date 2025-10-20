// routes/agendamentos.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
// opcional: só admin pode apagar
const adminOnly = require('../middleware/adminOnly');

// helpers simples de validação
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(s);

// LISTAR (com filtros opcionais)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { cliente_id, data, de, ate, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = [];

    if (cliente_id) {
      params.push(Number(cliente_id));
      where.push(`a.cliente_id = $${params.length}`);
    }
    if (data) {
      if (!isISODate(data)) return res.status(400).json({ erro: 'data inválida (YYYY-MM-DD)' });
      params.push(data);
      where.push(`a.data = $${params.length}`);
    } else {
      if (de) {
        if (!isISODate(de)) return res.status(400).json({ erro: 'de inválido (YYYY-MM-DD)' });
        params.push(de);
        where.push(`a.data >= $${params.length}`);
      }
      if (ate) {
        if (!isISODate(ate)) return res.status(400).json({ erro: 'ate inválido (YYYY-MM-DD)' });
        params.push(ate);
        where.push(`a.data <= $${params.length}`);
      }
    }

    // paginação
    params.push(Math.min(Number(limit) || 100, 500));
    params.push(Number(offset) || 0);

    const sql = `
      SELECT
        a.id,
        a.cliente_id,
        c.nome AS cliente_nome,
        a.data,
        a.horario,
        a.servico,
        a.observacoes
      FROM agendamentos a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY a.data DESC, a.horario DESC, a.id DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// OBTER UM
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
        a.id,
        a.cliente_id,
        c.nome AS cliente_nome,
        a.data,
        a.horario,
        a.servico,
        a.observacoes
      FROM agendamentos a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      WHERE a.id = $1
    `;
    const { rows } = await pool.query(sql, [id]);
    if (!rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
});

// CRIAR
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { cliente_id, data, horario, servico, observacoes } = req.body;

    if (!cliente_id || !data || !horario || !servico) {
      return res.status(400).json({ erro: 'cliente_id, data, horario e servico são obrigatórios' });
    }
    if (!isISODate(data)) return res.status(400).json({ erro: 'data inválida (YYYY-MM-DD)' });
    if (!isTime(horario)) return res.status(400).json({ erro: 'horario inválido (HH:mm ou HH:mm:ss)' });

    const sql = `
      INSERT INTO agendamentos (cliente_id, data, horario, servico, observacoes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, cliente_id, data, horario, servico, observacoes
    `;
    const params = [cliente_id, data, horario, servico, observacoes || null];
    const { rows } = await pool.query(sql, params);
    res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', agendamento: rows[0] });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
});

// ATUALIZAR (parcial)
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    let { cliente_id, data, horario, servico, observacoes } = req.body;

    if (data && !isISODate(data)) return res.status(400).json({ erro: 'data inválida (YYYY-MM-DD)' });
    if (horario && !isTime(horario)) return res.status(400).json({ erro: 'horario inválido (HH:mm ou HH:mm:ss)' });

    const sql = `
      UPDATE agendamentos
      SET cliente_id  = COALESCE($1, cliente_id),
          data        = COALESCE($2, data),
          horario     = COALESCE($3, horario),
          servico     = COALESCE($4, servico),
          observacoes = COALESCE($5, observacoes)
      WHERE id = $6
      RETURNING id, cliente_id, data, horario, servico, observacoes
    `;
    const params = [
      cliente_id ?? null,
      data ?? null,
      horario ?? null,
      servico ?? null,
      (observacoes === undefined ? null : observacoes),
      id
    ];

    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento atualizado com sucesso!', agendamento: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
  }
});

// EXCLUIR
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM agendamentos WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir agendamento:', err);
    res.status(500).json({ erro: 'Erro ao excluir agendamento' });
  }
});

module.exports = router;
