const express = require('express');
const router = express.Router();
const pool = require('../db');

function buildDateTime({ data_hora, data, horario }) {
  if (data_hora) return data_hora;
  if (data && horario) return `${data} ${horario}`;
  return null;
}

// POST /agendamentos
router.post('/', autenticarToken, async (req, res) => {
  try {
    const dataHora = buildDateTime(req.body);
    const procedimento = req.body.procedimento ?? req.body.servico;
    const status = req.body.status ?? 'ativo';
    const admin_only = req.body.admin_only ?? false;

    if (!req.body.cliente_id || !dataHora || !procedimento) {
      return res.status(400).json({ erro: 'Campos obrigatórios: cliente_id, data_hora (ou data+horario), procedimento/servico.' });
    }

    const { rows } = await pool.query(`
      INSERT INTO agendamentos (cliente_id, data_hora, procedimento, status, admin_only)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [req.body.cliente_id, dataHora, procedimento, status, admin_only]);

    res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', agendamento: rows[0] });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
});

// GET /agendamentos?data=YYYY-MM-DD
router.get('/', autenticarToken, async (req, res) => {
  const { data } = req.query;
  const isAdmin = !!req.user?.is_admin;
  try {
    let q = `
      SELECT a.*, c.nome AS nome_cliente
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
    `;
    const where = [], vals = [];

    if (data) { where.push(`DATE(a.data_hora) = $${vals.length + 1}`); vals.push(data); }
    if (!isAdmin) where.push(`COALESCE(a.admin_only, false) = false`);

    if (where.length) q += ' WHERE ' + where.join(' AND ');
    q += ' ORDER BY a.data_hora';

    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
});

// GET /agendamentos/:id
router.get('/:id', autenticarToken, async (req, res) => {
  const isAdmin = !!req.user?.is_admin;
  try {
    const { rows } = await pool.query(`
      SELECT a.*, c.nome AS nome_cliente
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      WHERE a.id = $1;
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    const ag = rows[0];
    if (ag.admin_only && !isAdmin) return res.status(403).json({ erro: 'Acesso restrito ao admin.' });
    res.json(ag);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamento.' });
  }
});

// PUT /agendamentos/:id
router.put('/:id', autenticarToken, async (req, res) => {
  const isAdmin = !!req.user?.is_admin;
  try {
    const chk = await pool.query('SELECT admin_only FROM agendamentos WHERE id = $1', [req.params.id]);
    if (!chk.rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (chk.rows[0].admin_only && !isAdmin) return res.status(403).json({ erro: 'Apenas admin pode editar este agendamento.' });

    const dataHora = buildDateTime(req.body);
    const procedimento = req.body.procedimento ?? req.body.servico;
    const status = req.body.status;
    const admin_only = req.body.admin_only;

    const { rows } = await pool.query(`
      UPDATE agendamentos
      SET cliente_id  = COALESCE($1, cliente_id),
          data_hora   = COALESCE($2, data_hora),
          procedimento= COALESCE($3, procedimento),
          status      = COALESCE($4, status),
          admin_only  = COALESCE($5, admin_only)
      WHERE id = $6
      RETURNING *;
    `, [
      req.body.cliente_id ?? null,
      dataHora ?? null,
      procedimento ?? null,
      status ?? null,
      admin_only ?? null,
      req.params.id
    ]);

    res.json({ mensagem: 'Agendamento atualizado com sucesso!', agendamento: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
  }
});

// DELETE /agendamentos/:id (admin)
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM agendamentos WHERE id = $1 RETURNING *;', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json({ mensagem: 'Agendamento cancelado com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao deletar agendamento.' });
  }
});

// POST /agendamentos/:id/historico
router.post('/:id/historico', autenticarToken, async (req, res) => {
  const isAdmin = !!req.user?.is_admin;
  try {
    const r = await pool.query('SELECT * FROM agendamentos WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    const ag = r.rows[0];
    if (ag.admin_only && !isAdmin) return res.status(403).json({ erro: 'Apenas admin pode mover este agendamento.' });

    // ajuste os campos conforme o schema real da tabela "historico"
    await pool.query(`
      INSERT INTO historico (cliente_id, data_hora, procedimento, status)
      VALUES ($1, $2, $3, $4);
    `, [ag.cliente_id, ag.data_hora, ag.procedimento, ag.status]);

    await pool.query('DELETE FROM agendamentos WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Agendamento movido para histórico com sucesso!' });
  } catch (err) {
    console.error('Erro ao mover para histórico:', err);
    res.status(500).json({ erro: 'Erro ao mover para histórico.' });
  }
});

module.exports = router;
