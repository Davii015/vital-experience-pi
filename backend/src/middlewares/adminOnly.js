module.exports = function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Esta ação é exclusiva do administrador' });
  next();
};
