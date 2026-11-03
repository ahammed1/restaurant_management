const crypto = require('crypto');
const { promisify } = require('util');
const db = require('../config/db');
const authService = require('../services/authService');

const scrypt = promisify(crypto.scrypt);
const PASSWORD_KEY_LENGTH = 64;

function publicUser(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone
  };
}

async function passwordHash(password, salt) {
  return scrypt(password, salt, PASSWORD_KEY_LENGTH);
}

function startSession(res, user) {
  const token = authService.createSession(publicUser(user));
  authService.setSessionCookie(res, token);
  res.json({ success: true, user: publicUser(user) });
}

exports.me = (req, res) => {
  res.json({ success: true, user: req.user || null });
};

exports.registerCustomer = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 80 ||
    typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== 'string' || !phone.trim() || phone.trim().length > 32 ||
    typeof password !== 'string' || password.length < 8 || password.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message: 'Enter your name, a valid email, phone number, and a password of at least 8 characters.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.findCustomerByEmail(normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await passwordHash(password, salt)).toString('hex');
  if (db.findCustomerByEmail(normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
  }
  const customer = {
    id: crypto.randomUUID(),
    role: 'customer',
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };
  db.addCustomer(customer);
  startSession(res, customer);
};

exports.login = async (req, res) => {
  const { role, email, password } = req.body;
  if (
    !['customer', 'staff'].includes(role) ||
    typeof email !== 'string' || email.length > 254 ||
    typeof password !== 'string' || password.length > 128
  ) {
    return res.status(400).json({ success: false, message: 'Choose a login type and enter your email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (role === 'staff') {
    const staffEmail = process.env.STAFF_EMAIL;
    const staffPassword = process.env.STAFF_PASSWORD;
    if (!staffEmail || !staffPassword) {
      return res.status(503).json({ success: false, message: 'Staff login is not configured on the server.' });
    }

    const emailMatches = normalizedEmail === staffEmail.trim().toLowerCase();
    const passwordMatches = crypto.timingSafeEqual(
      crypto.createHash('sha256').update(password).digest(),
      crypto.createHash('sha256').update(staffPassword).digest()
    );
    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return startSession(res, {
      id: 'staff',
      role: 'staff',
      name: 'Restaurant Staff',
      email: staffEmail.trim().toLowerCase()
    });
  }

  const customer = db.findCustomerByEmail(normalizedEmail);
  if (!customer || !customer.passwordHash || !customer.passwordSalt) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const submittedHash = await passwordHash(password, customer.passwordSalt);
  const savedHash = Buffer.from(customer.passwordHash, 'hex');
  if (submittedHash.length !== savedHash.length || !crypto.timingSafeEqual(submittedHash, savedHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  startSession(res, customer);
};

exports.logout = (req, res) => {
  authService.destroySession(req);
  authService.clearSessionCookie(res);
  res.json({ success: true });
};
