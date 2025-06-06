const pool = require('./db');

async function criarTabelaAgendamentos() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        data DATE NOT NULL,
        horario TIME NOT NULL,
        servico TEXT NOT NULL,
        observacoes TEXT
      )
    `);

    console.log('Tabela agendamentos criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabela agendamentos:', err);
  } finally {
    pool.end();
  }
}

criarTabelaAgendamentos();
