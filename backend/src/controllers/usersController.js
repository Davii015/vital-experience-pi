const pool = require('../config/database');

async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  const { name, age, gender, condition, professional_id } = req.body;
  if (!name || !age || !condition) return res.status(400).json({ error: 'name, age e condition são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, age, gender, condition, professional_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, age, gender || null, condition, professional_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  const { name, age, gender, condition, professional_id } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET name=$1, age=$2, gender=$3, condition=$4, professional_id=$5 WHERE id=$6 RETURNING *',
      [name, age, gender, condition, professional_id || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAll, getById, create, update, remove };
