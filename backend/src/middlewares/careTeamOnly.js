module.exports = function careTeamOnly(req, res, next) {
  if (!['ADMIN', 'PROFESSIONAL'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Somente a equipe responsável pode registrar ou alterar atendimentos' });
  }
  next();
};
