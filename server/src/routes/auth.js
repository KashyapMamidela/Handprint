import { Router } from 'express';
import { pool } from '../db.js';
import { hashPassword, verifyPassword, signToken, initialsFromName } from '../lib/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { wrap } from '../lib/wrap.js';

const router = Router();

router.post('/signup', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const initials = initialsFromName(name);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, initials) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, initials]
  );

  const token = signToken(result.insertId);
  const [[user]] = await pool.query(
    'SELECT id, name, email, role, initials, created_at FROM users WHERE id = ?',
    [result.insertId]
  );
  res.status(201).json({ token, user });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user.id);
  delete user.password_hash;
  res.json({ token, user });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
