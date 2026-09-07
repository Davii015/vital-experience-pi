require('dotenv').config();
const express = require('express');
const cors    = require('cors');

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

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.json({ name: 'Vital Experience API', version: '2.0.0', status: 'ok' }));
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
