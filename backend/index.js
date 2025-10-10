// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// === CORS: libera o domínio do Vercel e o dev local ===
const allowedOrigins = [
  process.env.FRONT_URL,
  'http://localhost:5173'
].filter(Boolean);

// CORS principal
app.use(cors({
  origin: function (origin, callback) {
    // permite chamadas do fetch sem origin (ex.: healthchecks) e dos domínios liberados
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Resposta automática ao preflight
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === CORS fallback para garantir preflight no Railway ===
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin) res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});

// === Uploads: usa env para funcionar no Railway (com Volume) ===
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

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
