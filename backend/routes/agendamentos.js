const adminOnly = require('../middleware/adminOnly');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');

// Cadastrar novo agendamento para um cliente
router.post('/', autenticarToken, async (req, res) => {
  const { cliente_id, data, horario, servico, observacoes } = req.body;

  try {
    const resultado = await pool.query(`
      INSERT INTO agendamentos (cliente_id, data, horario, servico, observacoes)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cliente_id, data, horario, servico, observacoes]
    );

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso!',
      agendamento: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao criar agendamento.' });
  }
});

// Listar todos os agendamentos
router.get('/', autenticarToken, async (req, res) => {
  const { data } = req.query;

  try {
    let query = `
      SELECT a.*, c.nome AS nome_cliente 
      FROM agendamentos a 
      JOIN clientes c ON a.cliente_id = c.id`;
    let valores = [];

    if (data) {
      query += ' WHERE a.data = $1';
      valores.push(data);
    }

    query += ' ORDER BY a.data, a.horario';

    const resultado = await pool.query(query, valores);
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
});

// Buscar detalhes de um agendamento específico pelo ID
router.get('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(`
      SELECT a.*, c.nome AS nome_cliente 
      FROM agendamentos a 
      JOIN clientes c ON a.cliente_id = c.id 
      WHERE a.id = $1`, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamento.' });
  }
});

// Atualizar as informações de um agendamento existente
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { cliente_id, data, horario, servico, observacoes } = req.body;

  try {
    const resultado = await pool.query(`
      UPDATE agendamentos 
      SET cliente_id = $1, data = $2, horario = $3, servico = $4, observacoes = $5 
      WHERE id = $6 
      RETURNING *`,
      [cliente_id, data, horario, servico, observacoes, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.status(200).json({
      mensagem: 'Agendamento atualizado com sucesso!',
      agendamento: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
  }
});

// Excluir um agendamento específico
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('DELETE FROM agendamentos WHERE id = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar agendamento:', err);
    res.status(500).json({ erro: 'Erro ao deletar agendamento.' });
  }
});

// Mover um agendamento específico para o histórico de procedimentos
router.post('/:id/historico', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const agendamento = await pool.query('SELECT * FROM agendamentos WHERE id = $1', [id]);

    if (agendamento.rows.length === 0) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    const { cliente_id, data, horario, servico, observacoes } = agendamento.rows[0];

    await pool.query(`
      INSERT INTO historico (cliente_id, data, horario, servico, observacoes)
      VALUES ($1, $2, $3, $4, $5)`,
      [cliente_id, data, horario, servico, observacoes]
    );

    await pool.query('DELETE FROM agendamentos WHERE id = $1', [id]);

    res.status(200).json({ mensagem: 'Agendamento movido para histórico com sucesso!' });
  } catch (err) {
    console.error('Erro ao mover para histórico:', err);
    res.status(500).json({ erro: 'Erro ao mover para histórico.' });
  }
});

module.exports = router;
