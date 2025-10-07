// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos da pasta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importa rotas
const rotasUsuarios = require('./routes/usuarios');
const rotasClientesFull = require('./routes/clientesfull');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos');
const rotasEstoque = require('./routes/estoque');
const rotasFornecedores = require('./routes/fornecedores');
const historicoRoutes = require('./routes/historico');
const boletosRouter = require('./routes/boletos');
const preCadastroRouter = require('./routes/precadastro');

// Define as rotas
app.use('/usuarios', rotasUsuarios);        // ✅ nova rota de cadastro
app.use('/login', rotasLogin);
app.use('/clientesfull', rotasClientesFull);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);
app.use('/fornecedores', rotasFornecedores);
app.use('/historico', historicoRoutes);
app.use('/boletos', boletosRouter);
app.use('/pre-cadastro', preCadastroRouter); // rota pública

// Teste de API
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
