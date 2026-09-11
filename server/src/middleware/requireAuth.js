import { pool } from '../db.js';
import { verifyToken } from '../lib/auth.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });

  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, initials, created_at FROM users WHERE id = ?',
      [payload.sub]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'User no longer exists' });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
