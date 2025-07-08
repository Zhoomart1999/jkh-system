const { Pool } = require('pg');

const pool = new Pool({
  user: 'jkh_user',
  host: 'localhost',
  database: 'jkh_db',
  password: 'yourpassword',
  port: 5432,
});

async function test() {
  const res = await pool.query('SELECT NOW()');
  console.log(res.rows[0]);
  await pool.end();
}

test(); 