const crypto = require('crypto');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

function getCookie(cookieHeader, name) {
  const cookie = (cookieHeader || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : null;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

function getUserFromRequest(req) {
  return getSession(getCookie(req.headers.cookie, 'restaurant_session'));
}

function getUserFromCookieHeader(cookieHeader) {
  return getSession(getCookie(cookieHeader, 'restaurant_session'));
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function destroySession(req) {
  const token = getCookie(req.headers.cookie, 'restaurant_session');
  if (token) sessions.delete(token);
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `restaurant_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`
  );
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `restaurant_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

module.exports = {
  createSession,
  destroySession,
  getUserFromCookieHeader,
  getUserFromRequest,
  setSessionCookie,
  clearSessionCookie
};
