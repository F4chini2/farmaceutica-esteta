const pool = require('./db');
const bcrypt = require('bcrypt');

const cadastrarUsuario = async () => {
  const email = 'admin@teste.com';
  const senha = '123456';

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO usuarios (email, senha) VALUES ($1, $2)',
      [email, senhaCriptografada]
    );

    console.log('✅ Usuário cadastrado com sucesso!');
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
  } finally {
    pool.end();
  }
};

cadastrarUsuario();
