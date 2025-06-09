// index.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// 🔓 Middleware
app.use(cors());
app.use(express.json());

// 📂 Servir imagens da pasta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📦 Importa rotas
const rotasClientes = require('./routes/clientes');
const rotasClientesFull = require('./routes/clientesfull');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos');
const rotasEstoque = require('./routes/estoque');
const rotasFornecedores = require('./routes/fornecedores');
const historicoRoutes = require('./routes/historico');

// 🚏 Define as rotas
app.use('/login', rotasLogin);
app.use('/clientes', rotasClientes);
app.use('/clientesfull', rotasClientesFull);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);
app.use('/fornecedores', rotasFornecedores);
app.use('/historico', historicoRoutes);

// 🔁 Teste de API
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// 🚀 Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
