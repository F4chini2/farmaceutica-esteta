// index.js (igual ao seu, mas com a rota /pre-cadastro registrada)
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

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

// ✅ NOVO: rota pública de pré-cadastro (usa o arquivo já enviado: routes/precadastro.js)
const preCadastroRouter = require('./routes/precadastro');

// Define as rotas
app.use('/login', rotasLogin);
app.use('/clientesfull', rotasClientesFull);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);
app.use('/fornecedores', rotasFornecedores);
app.use('/historico', historicoRoutes);
app.use('/boletos', boletosRouter);

// ✅ NOVO: registra o endpoint público
app.use('/pre-cadastro', preCadastroRouter);

// Teste de API
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
