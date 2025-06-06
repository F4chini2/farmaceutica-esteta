const pool = require('./db');

const criarTabelaUsuarios = async () => {
  try {
    await pool.query(`DROP TABLE IF EXISTS usuarios;`);

    await pool.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    console.log('✅ Tabela "usuarios" criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabela de usuários:', err);
  } finally {
    pool.end();
  }
};

criarTabelaUsuarios();
