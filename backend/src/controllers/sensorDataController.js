const service = require('../services/sensorDataService');
const { positiveInt } = require('../utils/validation');

async function getAll(req, res) { res.json(await service.list(req.user)); }
async function getBySession(req, res) { res.json(await service.bySession(positiveInt(req.params.sessionId, 'sessionId'), req.user)); }
async function create(req, res) { res.status(201).json(await service.create(req.body, req.user)); }
async function remove(req, res) { res.json(await service.remove(positiveInt(req.params.id, 'id'))); }

module.exports = { getAll, getBySession, create, remove };
