const express = require('express');
const router = express.Router();
const pool = require('../db');
const autenticarToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para armazenar arquivos na pasta /uploads/boletos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'boletos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeArquivo = `${Date.now()}-${file.originalname}`;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

// Criar novo boleto com upload
router.post('/', autenticarToken, upload.single('arquivo'), async (req, res) => {
  try {
    const { fornecedor_id, numero, valor, vencimento, observacoes } = req.body;
    const arquivoPath = req.file ? `/uploads/boletos/${req.file.filename}` : null;

    const resultado = await pool.query(
      `INSERT INTO boletos (fornecedor_id, numero, valor, vencimento, observacoes, arquivo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fornecedor_id, numero, valor, vencimento, observacoes, arquivoPath]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar boleto:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar boleto.' });
  }
});

// Listar boletos pendentes
router.get('/', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT b.*, f.nome AS nome_fornecedor
      FROM boletos b
      JOIN fornecedores f ON f.id = b.fornecedor_id
      WHERE pago = false
      ORDER BY vencimento ASC
    `);
    res.status(200).json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar boletos.' });
  }
});

// Listar boletos pagos
router.get('/pagos', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT b.*, f.nome AS nome_fornecedor
      FROM boletos b
      JOIN fornecedores f ON f.id = b.fornecedor_id
      WHERE pago = true
      ORDER BY vencimento DESC
    `);
    res.status(200).json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar boletos pagos.' });
  }
});

// Marcar boleto como pago
router.patch('/:id/pagar', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `UPDATE boletos SET pago = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.status(200).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao marcar como pago.' });
  }
});

// Excluir boleto
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    // Remove o arquivo do disco (se houver)
    const { rows } = await pool.query('SELECT arquivo FROM boletos WHERE id = $1', [req.params.id]);
    const arquivo = rows[0]?.arquivo;
    if (arquivo) {
      const caminho = path.join(__dirname, '..', arquivo);
      fs.unlink(caminho, () => {});
    }

    await pool.query('DELETE FROM boletos WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir boleto.' });
  }
});

module.exports = router;
