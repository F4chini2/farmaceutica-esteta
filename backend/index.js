require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'https://farmaceutica-esteta.com.br',
  'https://www.farmaceutica-esteta.com.br',
  process.env.FRONT_URL,
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('/*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (_req, res) => res.send('ok'));

app.use('/login', require('./routes/login'));
app.use('/pre-cadastro', require('./routes/precadastro'));

app.use('/usuarios', require('./routes/usuarios'));
app.use('/clientesfull', require('./routes/clientesfull'));
app.use('/fornecedores', require('./routes/fornecedores'));
app.use('/agendamentos', require('./routes/agendamentos'));
app.use('/boletos', require('./routes/boletos'));
app.use('/historico', require('./routes/historico'));
app.use('/estoque', require('./routes/estoque'));

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

app.listen(PORT, () => console.log(`✅ API on :${PORT}`));
