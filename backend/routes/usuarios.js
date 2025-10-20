const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Listar todos os usuários (apenas admin)
router.get('/', autenticarToken, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, role, tipo, perfil FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

// Buscar um usuário específico
router.get('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, nome, email, role, tipo, perfil FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});

// Criar novo usuário (apenas admin)
router.post('/', autenticarToken, adminOnly, async (req, res) => {
  const { nome, email, senha, role, tipo, perfil } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const existente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, role, tipo, perfil) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, role, tipo, perfil',
      [nome, email, senha, role || 'usuario', tipo || 'usuario', perfil || 'usuario']
    );

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário.' });
  }
});

// Atualizar usuário
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, role, tipo, perfil } = req.body;

  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           senha = COALESCE($3, senha),
           role = COALESCE($4, role),
           tipo = COALESCE($5, tipo),
           perfil = COALESCE($6, perfil)
       WHERE id = $7
       RETURNING id, nome, email, role, tipo, perfil`,
      [nome, email, senha, role, tipo, perfil, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ mensagem: 'Usuário atualizado com sucesso!', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ mensagem: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ erro: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
