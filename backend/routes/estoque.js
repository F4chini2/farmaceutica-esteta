// routes/estoque.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');

// GET /estoque - listar todos os itens
router.get('/', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM estoque ORDER BY id');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar estoque:', err);
    res.status(500).json({ erro: 'Erro ao buscar estoque.' });
  }
});

// POST /estoque - adicionar item
router.post('/', autenticarToken, async (req, res) => {
  const { nome, quantidade, unidade, validade } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO estoque (nome, quantidade, unidade, validade) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, quantidade, unidade, validade]
    );
    res.status(201).json({ mensagem: 'Item adicionado com sucesso!', item: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao adicionar item ao estoque:', err);
    res.status(500).json({ erro: 'Erro ao adicionar item.' });
  }
});

// Atualizar as informações de um item do estoque
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, quantidade, unidade, validade } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE estoque SET nome = $1, quantidade = $2, unidade = $3, validade = $4 WHERE id = $5 RETURNING *',
      [nome, quantidade, unidade, validade, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.status(200).json({ mensagem: 'Item atualizado com sucesso!', item: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar item:', err);
    res.status(500).json({ erro: 'Erro ao atualizar item.' });
  }
});

// Remover um item do estoque pelo ID
router.delete('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM estoque WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }
    res.status(200).json({ mensagem: 'Item removido com sucesso!' });
  } catch (err) {
    console.error('Erro ao remover item do estoque:', err);
    res.status(500).json({ erro: 'Erro ao remover item.' });
  }
});

module.exports = router;
