require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 🧩 CORS — libera o front principal + localhost
app.use(cors({
  origin: [
    'https://farmaceutica-esteta.com.br',
    'https://www.farmaceutica-esteta.com.br', // caso use o www
    process.env.FRONT_URL,
    'http://localhost:5173'
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🗂️ Uploads (mantém compatibilidade com Hostinger)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// 🧠 Healthcheck
app.get('/health', (_req, res) => res.send('ok'));

// 🔐 Rotas públicas
app.use('/login', require('./routes/login'));
app.use('/pre-cadastro', require('./routes/precadastro'));

// 🔒 Rotas protegidas
app.use('/usuarios', require('./routes/usuarios'));
app.use('/clientesfull', require('./routes/clientesfull'));
app.use('/fornecedores', require('./routes/fornecedores'));
app.use('/agendamentos', require('./routes/agendamentos'));
app.use('/boletos', require('./routes/boletos'));
app.use('/historico', require('./routes/historico'));
app.use('/estoque', require('./routes/estoque'));

// ❌ 404 padrão
app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// 🚀 Inicia o servidor
app.listen(PORT, () => console.log(`✅ API on :${PORT}`));
