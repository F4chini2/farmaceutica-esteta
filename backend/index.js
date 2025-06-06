const express = require('express');
const app = express();
const PORT = 3001;

// Permite receber dados em JSON
app.use(express.json());

// Importa os arquivos de rotas
const rotasClientes = require('./routes/clientes');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos'); // <-- NOVO

// Aplica as rotas
app.use('/login', rotasLogin);
app.use('/clientes', rotasClientes);
app.use('/agendamentos', rotasAgendamentos); // <-- NOVO

// Rota básica de teste
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
