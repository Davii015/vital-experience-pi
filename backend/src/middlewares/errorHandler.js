const ApiError = require('../errors/ApiError');

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err && err.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um registro com um valor que deve ser único' });
  }

  if (err && err.code === 'P2003') {
    return res.status(409).json({ error: 'A operação viola um vínculo existente entre os dados' });
  }

  if (err && err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = errorHandler;
