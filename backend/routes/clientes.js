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

module.exports = router;
