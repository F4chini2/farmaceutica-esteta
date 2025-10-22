// routes/login.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usa SECRET (teu .env) e aceita JWT_SECRET se existir
const SECRET = process.env.SECRET || process.env.JWT_SECRET || 'chave-super-secreta';

router.post('/', async (req, res) => {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

    const emailNorm = String(email).trim().toLowerCase();
    const resultado = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [emailNorm]);
    if (resultado.rows.length === 0) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ mensagem: 'Login realizado com sucesso!', token });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no login.' });
  }
});

module.exports = router;
