import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'jkh_user',
  host: 'localhost',
  database: 'jkh_db',
  password: 'yourpassword', // замените на ваш пароль!
  port: 5432,
});

const app = express();

// Добавляем CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// --- USERS ---
app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows);
});

app.post('/api/users', async (req, res) => {
  const { name, role, pin, is_active } = req.body;
  const result = await pool.query(
    'INSERT INTO users (name, role, pin, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, role, pin, is_active ?? true]
  );
  res.json(result.rows[0]);
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, pin, is_active } = req.body;
  const result = await pool.query(
    'UPDATE users SET name=$1, role=$2, pin=$3, is_active=$4 WHERE id=$5 RETURNING *',
    [name, role, pin, is_active, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ success: true });
});

// --- ABONENTS ---
app.get('/api/abonents', async (req, res) => {
  const result = await pool.query('SELECT * FROM abonents ORDER BY id');
  res.json(result.rows);
});

app.post('/api/abonents', async (req, res) => {
  const { full_name, address, phone, number_of_people, building_type, water_tariff, status, balance } = req.body;
  const result = await pool.query(
    'INSERT INTO abonents (full_name, address, phone, number_of_people, building_type, water_tariff, status, balance) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [full_name, address, phone, number_of_people, building_type, water_tariff, status, balance ?? 0]
  );
  res.json(result.rows[0]);
});

app.put('/api/abonents/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, address, phone, number_of_people, building_type, water_tariff, status, balance } = req.body;
  const result = await pool.query(
    'UPDATE abonents SET full_name=$1, address=$2, phone=$3, number_of_people=$4, building_type=$5, water_tariff=$6, status=$7, balance=$8 WHERE id=$9 RETURNING *',
    [full_name, address, phone, number_of_people, building_type, water_tariff, status, balance, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/abonents/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM abonents WHERE id=$1', [id]);
  res.json({ success: true });
});

// --- PAYMENTS ---
app.get('/api/payments', async (req, res) => {
  const result = await pool.query('SELECT * FROM payments ORDER BY id');
  res.json(result.rows);
});

app.post('/api/payments', async (req, res) => {
  let { abonent_id, amount, date, method, payment_method, collector_id, recorded_by, comment } = req.body;
  collector_id = collector_id && !isNaN(Number(collector_id)) ? Number(collector_id) : null;
  recorded_by = recorded_by && !isNaN(Number(recorded_by)) ? Number(recorded_by) : null;
  const result = await pool.query(
    'INSERT INTO payments (abonent_id, amount, date, method, payment_method, collector_id, recorded_by, comment) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [abonent_id, amount, date ?? new Date(), method, payment_method, collector_id, recorded_by, comment]
  );
  res.json(result.rows[0]);
});

app.put('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  const { abonent_id, amount, date, method, payment_method, collector_id, recorded_by, comment } = req.body;
  const result = await pool.query(
    'UPDATE payments SET abonent_id=$1, amount=$2, date=$3, method=$4, payment_method=$5, collector_id=$6, recorded_by=$7, comment=$8 WHERE id=$9 RETURNING *',
    [abonent_id, amount, date, method, payment_method, collector_id, recorded_by, comment, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM payments WHERE id=$1', [id]);
  res.json({ success: true });
});

// --- TARIFFS ---
app.get('/api/tariffs', async (req, res) => {
  const result = await pool.query('SELECT * FROM tariffs ORDER BY id');
  res.json(result.rows);
});

app.post('/api/tariffs', async (req, res) => {
  const { version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active, description } = req.body;
  const result = await pool.query(
    'INSERT INTO tariffs (version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
    [version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active ?? true, description]
  );
  res.json(result.rows[0]);
});

app.put('/api/tariffs/:id', async (req, res) => {
  const { id } = req.params;
  const { version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active, description } = req.body;
  const result = await pool.query(
    'UPDATE tariffs SET version=$1, effective_date=$2, water_by_meter=$3, water_by_person=$4, garbage_private=$5, garbage_apartment=$6, sales_tax_percent=$7, penalty_rate_percent=$8, created_by=$9, is_active=$10, description=$11 WHERE id=$12 RETURNING *',
    [version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active, description, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/tariffs/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tariffs WHERE id=$1', [id]);
  res.json({ success: true });
});

// --- START SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
}); 