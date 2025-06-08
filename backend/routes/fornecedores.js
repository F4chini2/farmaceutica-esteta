// routes/fornecedores.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');

// GET /fornecedores - listar todos
router.get('/', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM fornecedores ORDER BY id');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar fornecedores:', err);
    res.status(500).json({ erro: 'Erro ao buscar fornecedores.' });
  }
});

// POST /fornecedores - criar novo
router.post('/', autenticarToken, async (req, res) => {
  const { nome, cnpj, contato, produtos, observacoes } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO fornecedores (nome, cnpj, contato, produtos, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, cnpj, contato, produtos, observacoes]
    );
    res.status(201).json({ mensagem: 'Fornecedor criado com sucesso!', fornecedor: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao adicionar fornecedor:', err);
    res.status(500).json({ erro: 'Erro ao adicionar fornecedor.' });
  }
});

// PUT /fornecedores/:id - atualizar
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, contato, produtos, observacoes } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE fornecedores SET nome = $1, cnpj = $2, contato = $3, produtos = $4, observacoes = $5 WHERE id = $6 RETURNING *',
      [nome, cnpj, contato, produtos, observacoes, id]
    );
    if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    res.status(200).json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar fornecedor:', err);
    res.status(500).json({ erro: 'Erro ao atualizar fornecedor.' });
  }
});

// DELETE /fornecedores/:id - remover
router.delete('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM fornecedores WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    res.status(200).json({ mensagem: 'Fornecedor removido com sucesso!' });
  } catch (err) {
    console.error('Erro ao remover fornecedor:', err);
    res.status(500).json({ erro: 'Erro ao remover fornecedor.' });
  }
});

module.exports = router;
