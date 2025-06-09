// clientesfull.js

const autenticarToken = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Verifica se há agendamentos antes de deletar cliente
async function clienteTemAgendamentos(id) {
  const resultado = await pool.query('SELECT COUNT(*) FROM agendamentos WHERE cliente_id = $1', [id]);
  return parseInt(resultado.rows[0].count) > 0;
}

// POST /clientesfull
router.post('/', autenticarToken, async (req, res) => {
  try {
    const cliente = req.body;
    if (!cliente.nome || !cliente.cpf) {
      return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
    }

    const resultado = await pool.query(
      `INSERT INTO clientes (
        nome, telefone, alergias, descricao, idade, endereco, instagram, motivo_avaliacao,
        tratamento_anterior, alergia_medicamento, uso_medicamento,
        usa_filtro_solar, usa_acido_peeling, problema_pele, gravida,
        cor_pele, biotipo_pele, hidratacao, acne,
        textura_pele, envelhecimento, rugas, cpf
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *`,
      [
        cliente.nome, cliente.telefone, cliente.alergias, cliente.descricao,
        cliente.idade === '' ? null : parseInt(cliente.idade),
        cliente.endereco, cliente.instagram, cliente.motivo_avaliacao,
        cliente.tratamento_anterior, cliente.alergia_medicamento, cliente.uso_medicamento,
        cliente.usa_filtro_solar === 'true', cliente.usa_acido_peeling === 'true', cliente.problema_pele, cliente.gravida === 'true',
        cliente.cor_pele, cliente.biotipo_pele, cliente.hidratacao, cliente.acne,
        cliente.textura_pele, cliente.envelhecimento, cliente.rugas, cliente.cpf
      ]
    );
    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso!', cliente: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
  }
});

// PUT /clientesfull/:id
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const cliente = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE clientes SET
        nome = $1, telefone = $2, alergias = $3, descricao = $4,
        idade = $5, endereco = $6, instagram = $7, motivo_avaliacao = $8,
        tratamento_anterior = $9, alergia_medicamento = $10, uso_medicamento = $11,
        usa_filtro_solar = $12, usa_acido_peeling = $13, problema_pele = $14, gravida = $15,
        cor_pele = $16, biotipo_pele = $17, hidratacao = $18, acne = $19,
        textura_pele = $20, envelhecimento = $21, rugas = $22, cpf = $23
        WHERE id = $24
        RETURNING *`,
      [
        cliente.nome, cliente.telefone, cliente.alergias, cliente.descricao,
        cliente.idade === '' ? null : parseInt(cliente.idade),
        cliente.endereco, cliente.instagram, cliente.motivo_avaliacao,
        cliente.tratamento_anterior, cliente.alergia_medicamento, cliente.uso_medicamento,
        cliente.usa_filtro_solar === 'true', cliente.usa_acido_peeling === 'true', cliente.problema_pele, cliente.gravida === 'true',
        cliente.cor_pele, cliente.biotipo_pele, cliente.hidratacao, cliente.acne,
        cliente.textura_pele, cliente.envelhecimento, cliente.rugas, cliente.cpf, id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!', cliente: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
  }
});

// GET /clientesfull
router.get('/', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id');
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// GET /clientesfull/:id
router.get('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ erro: 'Erro ao buscar cliente.' });
  }
});

// DELETE /clientesfull/:id
router.delete('/:id', autenticarToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    if (await clienteTemAgendamentos(id)) {
      return res.status(400).json({ erro: 'Não é possível excluir cliente com agendamentos vinculados.' });
    }

    const resultado = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json({ mensagem: 'Cliente removido com sucesso!' });
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    res.status(500).json({ erro: 'Erro ao deletar cliente.' });
  }
});

module.exports = router;