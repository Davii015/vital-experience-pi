const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM sensors ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM sensors WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Sensor não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  const { type, model, serial_number, status, user_id } = req.body;
  if (!type || !model) return res.status(400).json({ error: 'type e model são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO sensors (type, model, serial_number, status, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [type, model, serial_number || null, status || 'Ativo', user_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  const { type, model, serial_number, status, user_id } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE sensors SET type=$1, model=$2, serial_number=$3, status=$4, user_id=$5 WHERE id=$6 RETURNING *',
      [type, model, serial_number, status, user_id || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Sensor não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM sensors WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Sensor não encontrado' });
    res.json({ message: 'Sensor removido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAll, getById, create, update, remove };
