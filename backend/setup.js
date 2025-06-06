const pool = require('./db');

const ajustarTabelaClientes = async () => {
  try {
    await pool.query(`DROP TABLE IF EXISTS clientes;`);

    await pool.query(`
      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        alergias TEXT
      );
    `);

    console.log('✅ Tabela "clientes" recriada com coluna ID autoincrementada!');
  } catch (err) {
    console.error('Erro ao ajustar tabela:', err);
  } finally {
    pool.end();
  }
};

ajustarTabelaClientes();
