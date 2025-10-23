// db.js
const { Pool } = require('pg');

// Primeiro tenta usar DATABASE_URL (Cloud SQL)
if (process.env.DATABASE_URL) {
  module.exports = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // necessário para Google Cloud
  });
} else {
  // fallback para ambiente local/dev (caso esteja rodando na sua máquina)
  module.exports = new Pool({
    user: 'tcc_user',
    host: '127.0.0.1',
    database: 'tcc_db',
    password: 'Tcc@12345678',
    port: 5432
  });
}
