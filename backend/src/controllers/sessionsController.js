const service = require('../services/sessionsService');
const { positiveInt } = require('../utils/validation');

async function getAll(req, res) { res.json(await service.list(req.user)); }
async function getById(req, res) { res.json(await service.get(positiveInt(req.params.id, 'id'), req.user)); }
async function create(req, res) { res.status(201).json(await service.create(req.body, req.user)); }
async function update(req, res) { res.json(await service.update(positiveInt(req.params.id, 'id'), req.body, req.user)); }
async function remove(req, res) { res.json(await service.remove(positiveInt(req.params.id, 'id'))); }

module.exports = { getAll, getById, create, update, remove };
