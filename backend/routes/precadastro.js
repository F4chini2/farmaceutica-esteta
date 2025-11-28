// routes/precadastro.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ⚠️ Sem importar validations do front no back.
// O front já faz as validações de nome/telefone.

router.post('/', async (req, res) => {
  try {
    let { nome, endereco, telefone, procedimentos, autoriza_fotos } = req.body || {};

    // Validação mínima no back (sempre bom garantir)
    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ erro: 'Nome é obrigatório.' });
    }

    // Normalizações simples
    nome = String(nome).trim();
    endereco = endereco ? String(endereco).trim() : null;
    telefone = telefone ? String(telefone).trim() : null;
    procedimentos = procedimentos ? String(procedimentos).trim() : null;

    // Converte autoriza_fotos para boolean
    const fotos =
      autoriza_fotos === true ||
      autoriza_fotos === 'true' ||
      autoriza_fotos === 1 ||
      autoriza_fotos === '1';

    const result = await pool.query(
      `INSERT INTO clientes (
         nome, endereco, telefone, procedimentos, autoriza_fotos
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome`,
      [nome, endereco, telefone, procedimentos, fotos]
    );

    return res.status(201).json({
      mensagem: 'Pré-cadastro recebido!',
      cliente: result.rows[0],
    });
  } catch (err) {
    console.error('Erro no pré-cadastro:', err);
    return res.status(500).json({
      erro: 'Erro ao salvar o pré-cadastro.',
      detalhe: err.message, // ajuda a debugar se ainda der problema
    });
  }
});

module.exports = router;
