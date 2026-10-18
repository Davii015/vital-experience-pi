require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('node:path');

const authRoutes       = require('./src/routes/auth');
const userRoutes       = require('./src/routes/users');
const professionalRoutes = require('./src/routes/professionals');
const sensorRoutes     = require('./src/routes/sensors');
const sessionRoutes    = require('./src/routes/sessions');
const sensorDataRoutes = require('./src/routes/sensorData');
const reportRoutes     = require('./src/routes/reports');
const errorHandler     = require('./src/middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map((item) => item.trim()).filter(Boolean);
if (allowedOrigins.length) {
  app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), credentials: true }));
}
app.use(express.json());
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/app', express.static(path.resolve(__dirname, '../frontend')));

app.get('/', (_, res) => res.json({ name: 'Vital Experience API', version: '2.1.0', status: 'ok', frontend: '/app/' }));
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/sensors',       sensorRoutes);
app.use('/api/sessions',      sessionRoutes);
app.use('/api/sensor-data',   sensorDataRoutes);
app.use('/api/reports',       reportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => console.log(`Vital Experience API rodando na porta ${PORT}`));
}

module.exports = app;
