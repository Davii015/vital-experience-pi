const NAME = 've_session';

function options(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  };
}

function readCookie(req) {
  const pair = (req.headers.cookie || '').split(';').map((item) => item.trim())
    .find((item) => item.startsWith(`${NAME}=`));
  if (!pair) return null;
  try { return decodeURIComponent(pair.slice(NAME.length + 1)); }
  catch { return null; }
}

module.exports = { NAME, options, readCookie };
