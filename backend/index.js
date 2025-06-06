const express = require('express');
const app = express();
const PORT = 3001;

// Permite receber dados em JSON
app.use(express.json());

// Importa o arquivo de rotas de clientes
const rotasClientes = require('./routes/clientes');

const rotasLogin = require('./routes/login');
app.use('/login', rotasLogin);


// Usa essas rotas quando a URL começar com /clientes
app.use('/clientes', rotasClientes);

// Rota básica de teste
app.get('/', (req, res) => {
  res.send('API da Farmacêutica Esteta funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
