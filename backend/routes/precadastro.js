// routes/precadastro.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Pré-cadastro público (sem autenticação)
// Campos: nome, endereco, telefone, procedimentos, autoriza_fotos (boolean)
router.post('/', async (req, res) => {
  try {
    const { nome, endereco, telefone, procedimentos, autoriza_fotos } = req.body || {};
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });

    const result = await pool.query(
      `INSERT INTO clientes (nome, endereco, telefone, procedimentos, autoriza_fotos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome`,
      [
        nome || null,
        endereco || null,
        telefone || null,
        procedimentos || null,
        (autoriza_fotos === true || autoriza_fotos === 'true') ? true : false
      ]
    );

    res.status(201).json({ mensagem: 'Pré-cadastro recebido!', cliente: result.rows[0] });
  } catch (err) {
    console.error('Erro no pré-cadastro:', err);
    res.status(500).json({ erro: 'Erro ao salvar o pré-cadastro.' });
  }
});

module.exports = router;
