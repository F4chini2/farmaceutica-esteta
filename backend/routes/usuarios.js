// routes/usuarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-super-secreta';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

/** Middleware simples de autenticação (Bearer) */
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ erro: 'Token ausente.' });
  try {
    req.user = jwt.verify(h.slice(7), JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

/** POST /usuarios - cadastro */
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, descricao, senha, confirmar } = req.body || {};
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    if (senha !== confirmar) return res.status(400).json({ erro: 'As senhas não coincidem.' });
    if (String(senha).length < 6) return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });

    const emailNorm = String(email).trim().toLowerCase();
    const ja = await pool.query('SELECT 1 FROM usuarios WHERE LOWER(email) = $1', [emailNorm]);
    if (ja.rowCount > 0) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const q = await pool.query(
      `INSERT INTO usuarios (nome, email, telefone, descricao, senha)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, nome, email, tipo, telefone, descricao`,
      [nome || null, emailNorm, telefone || null, descricao || null, hash]
    );
    const usuario = q.rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', usuario, token });
  } catch (err) {
    console.error('Erro no cadastro de usuário:', err);
    if (err.code === '42703') return res.status(500).json({ erro: 'Colunas (nome/telefone/descricao) não existem na tabela.' });
    if (err.code === '23505') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
});

/** GET /usuarios - lista (protegido) */
router.get('/', auth, async (req, res) => {
  try {
    const q = await pool.query(`SELECT id, nome, email, tipo, telefone, descricao FROM usuarios ORDER BY id DESC`);
    return res.json(q.rows);
  } catch (err) {
    console.error('Erro listando usuários:', err);
    return res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
});

/** GET /usuarios/:id - detalhe (protegido) */
router.get('/:id', auth, async (req, res) => {
  try {
    const q = await pool.query(`SELECT id, nome, email, tipo, telefone, descricao FROM usuarios WHERE id = $1`, [req.params.id]);
    if (q.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    return res.json(q.rows[0]);
  } catch (err) {
    console.error('Erro buscando usuário:', err);
    return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

/** DELETE /usuarios/:id - só deletar (protegido) */
router.delete('/:id', auth, async (req, res) => {
  try {
    const alvo = parseInt(req.params.id, 10);
    if (Number.isNaN(alvo)) return res.status(400).json({ erro: 'ID inválido.' });
    if (Number(req.user?.id) === alvo) return res.status(403).json({ erro: 'Você não pode excluir seu próprio usuário.' });

    const del = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [alvo]);
    if (del.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    return res.json({ mensagem: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    return res.status(500).json({ erro: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
