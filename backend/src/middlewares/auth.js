const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { readCookie } = require('../utils/sessionCookie');

async function authMiddleware(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  const cookie = readCookie(req);
  const token = bearer || cookie;
  if (!token) return res.status(401).json({ error: 'Sessão não autenticada' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET não configurado' });

  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Sessão inválida ou expirada' }); }

  if (!Number.isInteger(payload.id) || !['ADMIN', 'PROFESSIONAL', 'PATIENT'].includes(payload.role)) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }

  try {
    const account = payload.role === 'ADMIN'
      ? await prisma.admin.findUnique({ where: { id: payload.id } })
      : payload.role === 'PROFESSIONAL'
        ? await prisma.professionalAccount.findUnique({ where: { id: payload.id }, include: { professional: true } })
        : await prisma.patientAccount.findUnique({ where: { id: payload.id }, include: { user: true } });
    if (!account || account.tokenVersion !== payload.version ||
        (payload.role === 'PROFESSIONAL' && account.professional.status !== 'ATIVO') ||
        (payload.role === 'PATIENT' && account.user.status !== 'ATIVO')) {
      return res.status(401).json({ error: 'Sessão revogada' });
    }
    if (!bearer && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const sent = req.get('X-CSRF-Token') || '';
      const expected = payload.csrf || '';
      const left = Buffer.from(sent);
      const right = Buffer.from(expected);
      if (!left.length || left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
        return res.status(403).json({ error: 'Token de proteção da requisição inválido' });
      }
    }
    req.user = { id: account.id, role: payload.role,
      ...(payload.role === 'PATIENT' ? { userId: account.userId, professionalId: account.user.professionalId } : {}),
      ...(payload.role === 'PROFESSIONAL' ? { professionalId: account.professionalId } : {}) };
    req.authMode = bearer ? 'bearer' : 'cookie';
    req.csrfToken = payload.csrf;
    return next();
  } catch (error) { return next(error); }
}

module.exports = authMiddleware;
