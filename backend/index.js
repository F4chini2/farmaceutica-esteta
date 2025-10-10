// index.js (corrigido com CORS + parsers + preflight)
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== CORS no topo (libera Vercel e dev local) =====
const WHITELIST = [
  process.env.FRONT_URL,      // ex.: https://farmaceutica-esteta.vercel.app
  'http://localhost:5173'     // dev (Vite)
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // permite chamadas sem Origin (ex.: curl/postman) e checa whitelist
    if (!origin || WHITELIST.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true, // deixe true apenas se for usar cookies; com Bearer não é necessário
}));

// Preflight global
app.options('*', cors());

// ===== Parsers de body (necessário para req.body no /login) =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== Uploads (use Volume no provedor e aponte com UPLOAD_DIR) =====
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// ===== Healthcheck público =====
app.get('/health', (_req, res) => res.status(200).send('ok'));

// ===== Rotas =====
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

app.get('/', (_req, res) => res.send('API da Farmacêutica Esteta funcionando!'));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
