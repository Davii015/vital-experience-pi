const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM sensor_data ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getBySession(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sensor_data WHERE session_id = $1 ORDER BY timestamp',
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  const { session_id, heart_rate, movement, effort_level, sp_o2, fatigue_state } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id é obrigatório' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO sensor_data (session_id, heart_rate, movement, effort_level, sp_o2, fatigue_state)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [session_id, heart_rate || null, movement || null, effort_level || null, sp_o2 || null, fatigue_state || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM sensor_data WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Dado não encontrado' });
    res.json({ message: 'Leitura removida' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAll, getBySession, create, remove };
