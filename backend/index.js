// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// === CORS (logo após criar o app) ===
const ALLOWED = [
  process.env.FRONT_URL,            // ex.: https://farmaceutica-esteta.vercel.app
  'http://localhost:5173'           // dev local
].filter(Boolean);

const vercelPreview = /\.vercel\.app$/;

app.use(cors({
  origin(origin, cb) {
    // Requisições sem Origin (ex.: /health via curl) — permite
    if (!origin) return cb(null, true);
    try {
      const hostname = new URL(origin).hostname;
      const ok = ALLOWED.includes(origin) || vercelPreview.test(hostname);
      return ok ? cb(null, true) : cb(new Error(`Origin not allowed: ${origin}`));
    } catch {
      // Se não conseguir parsear a URL da origin, nega
      return cb(new Error('Invalid Origin'));
    }
  },
  credentials: true, // se usar cookies; com Bearer é opcional
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
}));
app.options('*', cors());

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
