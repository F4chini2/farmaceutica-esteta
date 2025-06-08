const { Pool } = require('pg');

const pool = new Pool({
  user: 'tccuser',
  host: 'localhost',
  database: 'tccdb',
  password: 'tccpass',
  port: 5432,
});

module.exports = pool;
