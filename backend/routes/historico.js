
const express = require('express');
const router = express.Router();
const pool = require('../pool');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'procedimentos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET /clientes/:id/historico
router.get('/clientes/:id/historico', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM historico WHERE cliente_id = $1 ORDER BY data DESC, horario DESC',
      [id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// POST /clientes/:id/historico
router.post('/clientes/:id/historico', async (req, res) => {
  const { id } = req.params;
  const { data, horario, servico, observacoes } = req.body;

  try {
    const resultado = await pool.query(
      'INSERT INTO historico (cliente_id, data, horario, servico, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, data, horario, servico, observacoes]
    );
    res.status(201).json({ historico: resultado.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar procedimento' });
  }
});

// POST /historico/:id/fotos
router.post('/historico/:id/fotos', upload.array('fotos', 10), async (req, res) => {
  const { id } = req.params;
  const arquivos = req.files;

  try {
    const insercoes = await Promise.all(arquivos.map(arquivo => {
      const url = '/uploads/procedimentos/' + arquivo.filename;
      return pool.query(
        'INSERT INTO fotos_procedimentos (historico_id, url) VALUES ($1, $2) RETURNING *',
        [id, url]
      );
    }));
    res.status(201).json({ fotos: insercoes.map(r => r.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar fotos' });
  }
});

// GET /historico/:id/fotos
router.get('/historico/:id/fotos', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM fotos_procedimentos WHERE historico_id = $1',
      [id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar fotos' });
  }
});

module.exports = router;
