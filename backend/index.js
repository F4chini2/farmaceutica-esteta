
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ necessário para JSON (ex: cadastrar fornecedor)
app.use(express.urlencoded({ extended: true })); // ✅ necessário para form-data (ex: upload de boletos)

// Servir arquivos da pasta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importa rotas
const rotasClientesFull = require('./routes/clientesfull');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos');
const rotasEstoque = require('./routes/estoque');
const rotasFornecedores = require('./routes/fornecedores');
const historicoRoutes = require('./routes/historico');
const boletosRouter = require('./routes/boletos');
const clientesRouter = require('./routes/clientes');

// Define as rotas
app.use('/login', rotasLogin);
app.use('/clientesfull', rotasClientesFull);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);
app.use('/fornecedores', rotasFornecedores);
app.use('/historico', historicoRoutes);
app.use('/boletos', boletosRouter);
app.use('/clientes', clientesRouter);

// Teste de API
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
