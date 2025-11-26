// routes/usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

// NORMALIZAR entrada de "tipo"/"perfil"
function normalizeTipo(reqBody, fallback = 'comum') {
  const raw = (reqBody?.tipo ?? reqBody?.perfil ?? fallback)?.toString().toLowerCase().trim();
  return raw === 'admin' ? 'admin' : 'comum';
}

// REMOVER campo "senha" do objeto retornado
function stripSenha(u) {
  if (!u) return u;
  const { senha, ...rest } = u;
  return rest;
}

// LISTAR somente autenticado
router.get('/', autenticarToken, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, nome, telefone, descricao, tipo FROM usuarios ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar usuários:', e);
    res.status(500).json({ erro: 'erro interno ao listar usuários' });
  }
});

// CRIAR apenas ADMIN
router.post('/', autenticarToken, adminOnly, async (req, res) => {
  try {
    const { nome, email, senha, telefone, descricao } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'email e senha são obrigatórios' });
    }

    // E-mail único
    const exists = await pool.query('SELECT 1 FROM usuarios WHERE email=$1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ erro: 'email já cadastrado' });
    }

    const tipo = normalizeTipo(req.body, 'comum'); // 'admin' | 'comum'
    const hash = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (email, senha, tipo, nome, telefone, descricao)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, nome, telefone, descricao, tipo`,
      [email, hash, tipo, nome || null, telefone || null, descricao || null]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Erro ao criar usuário:', e);
    res.status(500).json({ erro: 'erro interno ao criar usuário' });
  }
});

// ATUALIZAR apenas ADMIN modifica tipo/senha; usuário comum pode editar seus dados não sensíveis se desejar adaptar
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Se NÃO é admin, bloqueia mudança de "tipo" e "senha".
    const isAdmin = req.user?.is_admin || req.user?.tipo === 'admin';
    let tipo = undefined;
    let senhaHash = undefined;

    if (isAdmin) {
      if (req.body?.tipo !== undefined || req.body?.perfil !== undefined) {
        tipo = normalizeTipo(req.body);
      }
      if (req.body?.senha) {
        senhaHash = await bcrypt.hash(req.body.senha, 10);
      }
    }

    const nome = req.body?.nome ?? undefined;
    const telefone = req.body?.telefone ?? undefined;
    const descricao = req.body?.descricao ?? undefined;
    const email = req.body?.email ?? undefined;

    // MONTAR UPDATE dinâmico
    const sets = [];
    const vals = [];
    let i = 1;

    const push = (field, val) => { sets.push(`${field} = $${i++}`); vals.push(val); };

    if (email !== undefined) push('email', email);
    if (nome !== undefined) push('nome', nome);
    if (telefone !== undefined) push('telefone', telefone);
    if (descricao !== undefined) push('descricao', descricao);
    if (isAdmin && tipo !== undefined) push('tipo', tipo);
    if (isAdmin && senhaHash !== undefined) push('senha', senhaHash);

    if (sets.length === 0) {
      return res.status(400).json({ erro: 'nada para atualizar' });
    }

    vals.push(id);
    const { rows, rowCount } = await pool.query(
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${i} 
       RETURNING id, email, nome, telefone, descricao, tipo`,
      vals
    );

    if (rowCount === 0) return res.status(404).json({ erro: 'usuário não encontrado' });
    res.json(rows[0]);
  } catch (e) {
    console.error('Erro ao atualizar usuário:', e);
    res.status(500).json({ erro: 'erro interno ao atualizar usuário' });
  }
});

// REMOVER apenas ADMIN
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ erro: 'usuário não encontrado' });
    res.status(204).end();
  } catch (e) {
    console.error('Erro ao remover usuário:', e);
    res.status(500).json({ erro: 'erro interno ao remover usuário' });
  }
});

module.exports = router;
