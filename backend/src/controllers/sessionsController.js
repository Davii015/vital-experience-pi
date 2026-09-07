const service = require('../services/sessionsService');
const { positiveInt } = require('../utils/validation');

async function getAll(req, res) { res.json(await service.list()); }
async function getById(req, res) { res.json(await service.get(positiveInt(req.params.id, 'id'))); }
async function create(req, res) { res.status(201).json(await service.create(req.body)); }
async function update(req, res) { res.json(await service.update(positiveInt(req.params.id, 'id'), req.body)); }
async function remove(req, res) { res.json(await service.remove(positiveInt(req.params.id, 'id'))); }

module.exports = { getAll, getById, create, update, remove };
