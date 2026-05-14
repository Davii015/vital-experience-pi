const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM sessions ORDER BY start_time DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  const { user_id, type, start_time, end_time, status, notes } = req.body;
  if (!user_id || !type || !start_time) return res.status(400).json({ error: 'user_id, type e start_time são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO sessions (user_id, type, start_time, end_time, status, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [user_id, type, start_time, end_time || null, status || 'Agendada', notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  const { user_id, type, start_time, end_time, status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE sessions SET user_id=$1, type=$2, start_time=$3, end_time=$4, status=$5, notes=$6 WHERE id=$7 RETURNING *',
      [user_id, type, start_time, end_time || null, status, notes || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    await pool.query('DELETE FROM sensor_data WHERE session_id = $1', [req.params.id]);
    const { rowCount } = await pool.query('DELETE FROM sessions WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json({ message: 'Sessão removida' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAll, getById, create, update, remove };
