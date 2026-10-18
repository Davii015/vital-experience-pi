const jwt = require('jsonwebtoken');
const service = require('../services/authService');
const sessionCookie = require('../utils/sessionCookie');

async function login(req, res) {
  const result = await service.login(req.body?.email, req.body?.password);
  if (req.body?.mode === 'bearer') {
    return res.json({ token: result.token, user: result.user });
  }
  const expiresAt = jwt.decode(result.token).exp * 1000;
  res.cookie(sessionCookie.NAME, result.token, sessionCookie.options(expiresAt - Date.now()));
  return res.json({ user: result.user, csrfToken: result.csrfToken });
}

function logout(req, res) {
  res.clearCookie(sessionCookie.NAME, sessionCookie.options());
  res.json({ message: 'Sessão local encerrada' });
}

async function me(req, res) {
  res.json({ user: await service.me(req.user.id), csrfToken: req.authMode === 'cookie' ? req.csrfToken : null });
}

async function updateMe(req, res) {
  res.json({ user: await service.updateMe(req.user.id, req.body || {}) });
}

async function changePassword(req, res) {
  const result = await service.changePassword(req.user.id, req.body?.currentPassword, req.body?.newPassword);
  res.clearCookie(sessionCookie.NAME, sessionCookie.options());
  res.json(result);
}

module.exports = { login, logout, me, updateMe, changePassword };
