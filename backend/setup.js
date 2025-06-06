const pool = require('./db');

const criarTabelaClientes = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        alergias TEXT
      )
    `);
    console.log('✅ Tabela "clientes" criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar a tabela:', err);
  } finally {
    pool.end();
  }
};

criarTabelaClientes();
