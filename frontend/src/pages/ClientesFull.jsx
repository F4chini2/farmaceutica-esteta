// backend/routes/clientesfull.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');

// Normaliza os campos do body
function normalizeBody(body) {
  const out = {};
  const FIELDS = [
    'nome', 'telefone', 'alergias', 'descricao', 'idade', 'cpf', 'endereco',
    'instagram', 'motivo_avaliacao', 'tratamento_anterior', 'alergia_medicamento',
    'uso_medicamento', 'usa_filtro_solar', 'usa_acido_peeling', 'problema_pele',
    'gravida', 'cor_pele', 'biotipo_pele', 'hidratacao', 'acne', 'textura_pele',
    'envelhecimento', 'rugas', 'procedimentos', 'autoriza_fotos'
  ];

  for (const key of FIELDS) {
    out[key] = key in body ? body[key] : null;
  }

  // garante booleanos corretos
  const bools = ['usa_filtro_solar', 'usa_acido_peeling', 'gravida', 'autoriza_fotos'];
  for (const k of bools) {
    if (out[k] !== null) out[k] = out[k] === true || out[k] === 'true';
  }

  // garante número válido ou null
  if (out.idade !== null) {
    const onlyDigits = String(out.idade).replace(/\D+/g, '');
    out.idade = onlyDigits === '' ? null : parseInt(onlyDigits, 10);
  }

  return out;
}

// Cadastrar cliente
router.post('/', autenticarToken, async (req, res) => {
  try {
    const data = normalizeBody(req.body);

    if (!data.nome || String(data.nome).trim() === '') {
      return res.status(400).json({ erro: 'O nome é obrigatório.' });
    }

    const campos = Object.keys(data);
    const valores = Object.values(data);
    const placeholders = campos.map((_, i) => `$${i + 1}`).join(',');

    const sql = `INSERT INTO clientes (${campos.join(',')})
                 VALUES (${placeholders})
                 RETURNING *`;

    const result = await pool.query(sql, valores);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    res.status(500).json({ erro: 'Erro interno ao cadastrar cliente.' });
  }
});

// Listar todos
router.get('/', autenticarToken, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ erro: 'Erro interno ao buscar clientes.' });
  }
});

module.exports = router;
