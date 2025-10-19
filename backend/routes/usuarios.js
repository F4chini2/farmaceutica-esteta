// routes/usuarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// LISTAR
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, tipo FROM usuarios ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
  }
});

// BUSCAR POR ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, tipo FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar usuário.' });
  }
});

// CRIAR
router.post('/', async (req, res) => {
  const { nome, email, senha, tipo } = req.body || {};
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1,$2,$3,$4) RETURNING id, nome, email, tipo',
      [nome, String(email).toLowerCase(), senhaHash, tipo || 'comum']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ erro: 'Erro interno ao criar usuário.' });
  }
});

// ATUALIZAR
router.put('/:id', async (req, res) => {
  const { nome, email, senha, tipo } = req.body || {};
  try {
    let query =
      'UPDATE usuarios SET nome=$1, email=$2, tipo=$3 WHERE id=$4 RETURNING id, nome, email, tipo';
    let params = [nome, email, tipo, req.params.id];

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      query =
        'UPDATE usuarios SET nome=$1, email=$2, senha=$3, tipo=$4 WHERE id=$5 RETURNING id, nome, email, tipo';
      params = [nome, email, senhaHash, tipo, req.params.id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar usuário.' });
  }
});

// EXCLUIR
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id=$1 RETURNING id', [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json({ mensagem: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({ erro: 'Erro interno ao excluir usuário.' });
  }
});

module.exports = router;
