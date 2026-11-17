const service = require('../services/reportsService');
const { positiveInt } = require('../utils/validation');

async function forUser(req, res) { res.json(await service.forUser(positiveInt(req.params.userId, 'userId'), req.user)); }
async function summary(req, res) { res.json(await service.summary(req.user)); }

module.exports = { forUser, summary };
