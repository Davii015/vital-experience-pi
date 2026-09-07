const service = require('../services/authService');

async function login(req, res) {
  res.json(await service.login(req.body.email, req.body.password));
}

function logout(req, res) {
  res.json({ message: 'Logout realizado. Descarte o token no cliente.' });
}

module.exports = { login, logout };
