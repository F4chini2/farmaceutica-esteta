const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = 'chave-super-secreta';

// POST /login
router.post('/', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = resultado.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    // Gera o token
    const token = jwt.sign(
  { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
  SECRET,
  { expiresIn: '2h' }
);

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro no login.' });
  }
});

module.exports = router;
