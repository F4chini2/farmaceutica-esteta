const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const bcrypt = require('bcryptjs');

/**
 * Normaliza senha:
 * - Se já vier hash bcrypt ($2...), mantém.
 * - Se vier em texto puro, gera hash com salt 10.
 */
async function normalizePassword(s) {
  if (!s) return null;
  if (typeof s === 'string' && s.startsWith('$2')) return s; // já é bcrypt
  return await bcrypt.hash(s, 10);
}

// Listar todos os usuários (apenas admin)
router.get('/', autenticarToken, adminOnly, async (_req, res) => {
  try {
    const sql = `
      SELECT id, nome, email, telefone, descricao, tipo
      FROM usuarios
      ORDER BY id ASC
    `;
    const result = await pool.query(sql);
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
    const sql = `
      SELECT id, nome, email, telefone, descricao, tipo
      FROM usuarios
      WHERE id = $1
    `;
    const result = await pool.query(sql, [id]);

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
  try {
    const { nome, email, senha, tipo, telefone, descricao } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    // e-mail único
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(email)=LOWER($1)', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await normalizePassword(senha);

    const sql = `
      INSERT INTO usuarios (nome, email, senha, tipo, telefone, descricao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, email, telefone, descricao, tipo
    `;
    const params = [nome, email, senhaHash, tipo || 'comum', telefone || null, descricao || null];
    const result = await pool.query(sql, params);

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário.' });
  }
});

// Atualizar usuário
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    let { nome, email, senha, tipo, telefone, descricao } = req.body;

    // se senha vier, normaliza (hash se necessário)
    if (senha) {
      senha = await normalizePassword(senha);
    }

    const sql = `
      UPDATE usuarios
      SET nome      = COALESCE($1, nome),
          email     = COALESCE($2, email),
          senha     = COALESCE($3, senha),
          tipo      = COALESCE($4, tipo),
          telefone  = COALESCE($5, telefone),
          descricao = COALESCE($6, descricao)
      WHERE id = $7
      RETURNING id, nome, email, telefone, descricao, tipo
    `;
    const params = [nome || null, email || null, senha || null, tipo || null, telefone || null, descricao || null, id];

    const result = await pool.query(sql, params);

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
  try {
    const { id } = req.params;
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
