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

  if (!Number.isInteger(payload.id) || payload.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Sessão inválida' });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin || admin.tokenVersion !== payload.version) {
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
    req.user = { id: admin.id, role: 'ADMIN' };
    req.authMode = bearer ? 'bearer' : 'cookie';
    req.csrfToken = payload.csrf;
    return next();
  } catch (error) { return next(error); }
}

module.exports = authMiddleware;
