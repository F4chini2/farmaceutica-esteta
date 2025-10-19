// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: libere Vercel + dev local (front)
app.use(cors({
  origin: [process.env.FRONT_URL, 'http://localhost:5173'].filter(Boolean),
  credentials: true
}));

// Body parsers (evita 400 por body vazio)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploads (opcional)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Healthcheck (VITAL pro Railway e pra você testar)
app.get('/health', (_req, res) => res.send('ok'));

// Rotas
app.use('/login', require('./routes/login'));               // pública
app.use('/pre-cadastro', require('./routes/preCadastro'));  // pública
app.use('/usuarios', require('./routes/usuarios'));         // protegida
app.use('/clientesfull', require('./routes/clientesfull')); // protegida

// 404 padrão
app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

app.listen(PORT, () => console.log(`API on :${PORT}`));
