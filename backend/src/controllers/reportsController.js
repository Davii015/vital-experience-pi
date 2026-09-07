const service = require('../services/reportsService');
const { positiveInt } = require('../utils/validation');

async function forUser(req, res) { res.json(await service.forUser(positiveInt(req.params.userId, 'userId'))); }
async function summary(req, res) { res.json(await service.summary()); }

module.exports = { forUser, summary };
