const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM professionals ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM professionals WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  const { name, specialty, email, phone } = req.body;
  if (!name || !specialty || !email) return res.status(400).json({ error: 'name, specialty e email são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO professionals (name, specialty, email, phone) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, specialty, email, phone || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  const { name, specialty, email, phone } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE professionals SET name=$1, specialty=$2, email=$3, phone=$4 WHERE id=$5 RETURNING *',
      [name, specialty, email, phone || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM professionals WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json({ message: 'Profissional removido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAll, getById, create, update, remove };
