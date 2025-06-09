const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');

// Cadastrar fornecedor
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { nome, cnpj, contato, email, produtos, observacoes } = req.body;

    const resultado = await pool.query(
      `INSERT INTO fornecedores (nome, cnpj, contato, email, produtos, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, cnpj, contato, email, produtos, observacoes]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar fornecedor:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar fornecedor.' });
  }
});

// Listar fornecedores
router.get('/', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM fornecedores ORDER BY nome ASC');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar fornecedores:', err);
    res.status(500).json({ erro: 'Erro ao buscar fornecedores.' });
  }
});

// Excluir fornecedor
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM fornecedores WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao excluir fornecedor:', err);
    res.status(500).json({ erro: 'Erro ao excluir fornecedor.' });
  }
});

module.exports = router;