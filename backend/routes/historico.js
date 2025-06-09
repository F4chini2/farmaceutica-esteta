const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configura armazenamento de imagens dos procedimentos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'procedimentos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Listar todos os procedimentos históricos de um cliente pelo ID
router.get('/clientes/:id/historico', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM historico WHERE cliente_id = $1 ORDER BY data DESC, horario DESC',
      [id]
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// Listar todos os procedimentos históricos de todos os clientes
router.get('/todos', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT h.*, c.nome AS nome_cliente FROM historico h JOIN clientes c ON h.cliente_id = c.id ORDER BY h.data DESC, h.horario DESC'
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar todos históricos:', err);
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// Adicionar um novo procedimento ao histórico de um cliente
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
    console.error('Erro ao cadastrar procedimento:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar procedimento' });
  }
});

// Enviar imagens relacionadas a um procedimento do histórico
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
    console.error('Erro ao salvar fotos:', err);
    res.status(500).json({ erro: 'Erro ao salvar fotos' });
  }
});

// Buscar imagens vinculadas a um procedimento do histórico
router.get('/historico/:id/fotos', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM fotos_procedimentos WHERE historico_id = $1',
      [id]
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar fotos:', err);
    res.status(500).json({ erro: 'Erro ao buscar fotos' });
  }
});


// Remover uma imagem de um procedimento do histórico
router.delete('/foto/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM fotos_procedimentos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Foto não encontrada.' });
    }

    const foto = resultado.rows[0];
    const caminho = path.join(__dirname, '..', foto.url); // Monta o caminho do arquivo

    fs.unlink(caminho, (err) => {
      if (err) {
        console.error('Erro ao excluir arquivo:', err);
      }
    });

    res.status(200).json({ mensagem: 'Foto excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir foto:', err);
    res.status(500).json({ erro: 'Erro ao excluir foto.' });
  }
});




// Remover um procedimento do histórico junto com suas imagens
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM fotos_procedimentos WHERE historico_id = $1', [id]);
    const resultado = await pool.query('DELETE FROM historico WHERE id = $1 RETURNING *', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Histórico não encontrado.' });
    }

    res.status(200).json({ mensagem: 'Histórico excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir histórico:', err);
    res.status(500).json({ erro: 'Erro ao excluir histórico.' });
  }
});


module.exports = router;