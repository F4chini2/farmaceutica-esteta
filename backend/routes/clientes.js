const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clientes
router.post('/', async (req, res) => {
  const { nome, telefone, alergias } = req.body;

  try {
    const resultado = await pool.query(
      'INSERT INTO clientes (nome, telefone, alergias) VALUES ($1, $2, $3) RETURNING *',
      [nome, telefone, alergias]
    );

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      cliente: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
  }
});

// GET /clientes
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// GET /clientes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ erro: 'Erro ao buscar cliente.' });
  }
});

// PUT /clientes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, alergias } = req.body;

  try {
    const resultado = await pool.query(
      'UPDATE clientes SET nome = $1, telefone = $2, alergias = $3 WHERE id = $4 RETURNING *',
      [nome, telefone, alergias, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json({
      mensagem: 'Cliente atualizado com sucesso!',
      cliente: resultado.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
  }
});


module.exports = router;
