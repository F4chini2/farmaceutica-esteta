import express from 'express';
import pool from '../db.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();
router.use(autenticar);

// === Buscar boletos pendentes ===
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM boletos WHERE pago = false ORDER BY vencimento DESC, id DESC'
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar boletos' });
  }
});

// === Buscar boletos pagos ===
router.get('/pagos', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM boletos WHERE pago = true ORDER BY pago_em DESC, id DESC'
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar boletos pagos' });
  }
});

// === Marcar boleto como pago ===
router.patch('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const agora = new Date();

    await pool.query(
      'UPDATE boletos SET pago = TRUE, pago_em = $1 WHERE id = $2',
      [agora, id]
    );

    res.json({ sucesso: true, pago_em: agora });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao marcar como pago' });
  }
});

// === Criar boleto ===
router.post('/', async (req, res) => {
  try {
    const { nome_fornecedor, numero, valor, vencimento, observacoes, arquivo } = req.body;

    const r = await pool.query(
      `INSERT INTO boletos (nome_fornecedor, numero, valor, vencimento, observacoes, arquivo, pago)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE)
       RETURNING *`,
      [nome_fornecedor, numero, valor, vencimento, observacoes, arquivo]
    );

    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar boleto' });
  }
});

// === Excluir boleto ===
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM boletos WHERE id = $1', [id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir boleto' });
  }
});

export default router;
