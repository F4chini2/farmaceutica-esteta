const pool = require('./db');

const adicionarTipoUsuario = async () => {
  try {
    // Adiciona a coluna "tipo" se não existir
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'comum';
    `);

    // Atualiza o usuário admin para tipo 'admin'
    await pool.query(`
      UPDATE usuarios 
      SET tipo = 'admin' 
      WHERE email = 'admin@teste.com';
    `);

    console.log('✅ Tipo de usuário atualizado com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar tipo de usuário:', err);
  } finally {
    pool.end();
  }
};

adicionarTipoUsuario();
