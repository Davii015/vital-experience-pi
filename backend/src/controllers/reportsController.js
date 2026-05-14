const pool = require('../config/database');

async function forUser(req, res) {
  const uid = parseInt(req.params.userId);
  try {
    const [userRes, sessionsRes] = await Promise.all([
      pool.query('SELECT * FROM users WHERE id = $1', [uid]),
      pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY start_time', [uid])
    ]);
    if (!userRes.rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });

    const sessions = sessionsRes.rows;
    const sessionIds = sessions.map(s => s.id);

    let readings = [];
    if (sessionIds.length) {
      const { rows } = await pool.query(
        'SELECT * FROM sensor_data WHERE session_id = ANY($1) ORDER BY timestamp',
        [sessionIds]
      );
      readings = rows;
    }

    const hrs     = readings.map(r => r.heart_rate).filter(Boolean);
    const avgHR   = hrs.length ? Math.round(hrs.reduce((a,b) => a+b,0) / hrs.length) : null;

    const effortDist  = {};
    const fatigueDist = {};
    readings.forEach(r => {
      if (r.effort_level)  effortDist[r.effort_level]   = (effortDist[r.effort_level]  || 0) + 1;
      if (r.fatigue_state) fatigueDist[r.fatigue_state] = (fatigueDist[r.fatigue_state]|| 0) + 1;
    });

    res.json({
      user:                 userRes.rows[0],
      totalSessions:        sessions.length,
      completedSessions:    sessions.filter(s => s.status === 'Concluída').length,
      totalReadings:        readings.length,
      avgHeartRate:         avgHR,
      effortDistribution:   effortDist,
      fatigueDistribution:  fatigueDist,
      sessions,
      readings
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function summary(req, res) {
  try {
    const [u, p, s, sess, sd] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM professionals'),
      pool.query("SELECT COUNT(*) FROM sensors WHERE status = 'Ativo'"),
      pool.query('SELECT COUNT(*) FROM sessions'),
      pool.query('SELECT COUNT(*) FROM sensor_data')
    ]);
    res.json({
      users:          parseInt(u.rows[0].count),
      professionals:  parseInt(p.rows[0].count),
      activeSensors:  parseInt(s.rows[0].count),
      sessions:       parseInt(sess.rows[0].count),
      sensorReadings: parseInt(sd.rows[0].count)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { forUser, summary };
