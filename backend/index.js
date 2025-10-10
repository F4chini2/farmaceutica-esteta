// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// === CORS HARDENED (primeiro middleware) ===
const FRONT_URL = process.env.FRONT_URL;
const DEV_URL = 'http://localhost:5173';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === FRONT_URL || origin === DEV_URL)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// === Uploads: usa env para funcionar no Railway (com Volume) ===
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === Healthcheck ===
app.get('/health', (_req, res) => res.send('ok'));

// Rotas
const rotasUsuarios = require('./routes/usuarios');
const rotasClientesFull = require('./routes/clientesfull');
const rotasLogin = require('./routes/login');
const rotasAgendamentos = require('./routes/agendamentos');
const rotasEstoque = require('./routes/estoque');
const rotasFornecedores = require('./routes/fornecedores');
const historicoRoutes = require('./routes/historico');
const boletosRouter = require('./routes/boletos');
const preCadastroRouter = require('./routes/precadastro');

app.use('/usuarios', rotasUsuarios);
app.use('/login', rotasLogin);
app.use('/clientesfull', rotasClientesFull);
app.use('/agendamentos', rotasAgendamentos);
app.use('/estoque', rotasEstoque);
app.use('/fornecedores', rotasFornecedores);
app.use('/historico', historicoRoutes);
app.use('/boletos', boletosRouter);
app.use('/pre-cadastro', preCadastroRouter);

// Raiz
app.get('/', (_req, res) => res.send('API da Farmacêutica Esteta funcionando!'));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
