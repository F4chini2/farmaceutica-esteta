// routes/precadastro.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
// importe se criou utils no back:
const { obrigatorio, validarTelefone, normalizarTelefone } = require('../utils/validations');

router.post('/', async (req, res) => {
  try {
    let { nome, endereco, telefone, procedimentos, autoriza_fotos } = req.body || {};

    // ✅ validações mínimas de segurança
    if (!obrigatorio(nome)) return res.status(400).json({ erro: 'Nome é obrigatório.' });

    if (telefone) {
      if (!validarTelefone(telefone)) {
        return res.status(400).json({ erro: 'Telefone inválido. Use DDD + número.' });
      }
      telefone = normalizarTelefone(telefone); // só dígitos
    } else {
      telefone = null;
    }

    // limite de comprimento para evitar payloads exagerados
    const lim = (s, n) => (s && String(s).length > n ? String(s).slice(0, n) : s);
    nome = lim(nome, 150);
    endereco = lim(endereco, 200);
    procedimentos = lim(procedimentos, 300);

    // coerção booleana
    const fotos = autoriza_fotos === true || autoriza_fotos === 'true';

    const result = await pool.query(
      `INSERT INTO clientes (nome, endereco, telefone, procedimentos, autoriza_fotos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome`,
      [nome || null, endereco || null, telefone, procedimentos || null, fotos]
    );

    res.status(201).json({ mensagem: 'Pré-cadastro recebido!', cliente: result.rows[0] });
  } catch (err) {
    console.error('Erro no pré-cadastro:', err);
    res.status(500).json({ erro: 'Erro ao salvar o pré-cadastro.' });
  }
});

module.exports = router;
