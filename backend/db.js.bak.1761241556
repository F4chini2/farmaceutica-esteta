// db.js
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { user:'tccuser', host:'localhost', database:'tccdb', password:'tccpass', port:5432 }
);

module.exports = pool;
