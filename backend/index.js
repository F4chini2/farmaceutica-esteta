const express = require('express');
const cors = require('cors'); // 👈 adicionado aqui
const app = express();
const PORT = 3001;

app.use(cors()); // 👈 ativando o CORS
app.use(express.json());

// Importa os arquivos de rotas
const rotasClientes = require('./routes/clientes');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos');
const rotasEstoque = require('./routes/estoque');

// Aplica as rotas
app.use('/login', rotasLogin);
app.use('/clientes', rotasClientes);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);

// Rota básica de teste
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
