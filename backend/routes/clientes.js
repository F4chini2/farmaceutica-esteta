const express = require('express');
const router = express.Router();

// Simulação de banco de dados
const clientes = [];

// Rota GET - listar todos os clientes
router.get('/', (req, res) => {
  res.json(clientes);
});

// Rota POST - cadastrar novo cliente
router.post('/', (req, res) => {
  const novoCliente = req.body;
  clientes.push(novoCliente);
  res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso!', cliente: novoCliente });
});

module.exports = router;
