import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { wrap } from '../lib/wrap.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const limit = Number(req.query.limit);
  const sql =
    'SELECT * FROM drives ORDER BY event_date IS NULL, event_date ASC' +
    (Number.isInteger(limit) && limit > 0 ? ' LIMIT ?' : '');
  const params = Number.isInteger(limit) && limit > 0 ? [limit] : [];
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

router.post('/', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const { name, org, description, event_date, hours_estimate, spots } = req.body;
  if (!name || !org) return res.status(400).json({ error: 'Name and org are required.' });

  const [result] = await pool.query(
    `INSERT INTO drives (name, org, description, event_date, hours_estimate, spots, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, org, description || '', event_date || null, hours_estimate || null, spots || null, req.user.id]
  );
  const [[drive]] = await pool.query('SELECT * FROM drives WHERE id = ?', [result.insertId]);
  res.status(201).json(drive);
}));

// Any admin can edit any drive — there's a single shared admin team, not
// per-drive ownership, so `created_by` is attribution only, not an access gate.
router.patch('/:id', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const [[drive]] = await pool.query('SELECT * FROM drives WHERE id = ?', [req.params.id]);
  if (!drive) return res.status(404).json({ error: 'Drive not found.' });

  const fields = ['name', 'org', 'description', 'event_date', 'hours_estimate', 'spots'];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

  await pool.query(
    `UPDATE drives SET ${updates.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`,
    [...updates.map((f) => req.body[f]), req.params.id]
  );
  const [[updated]] = await pool.query('SELECT * FROM drives WHERE id = ?', [req.params.id]);
  res.json(updated);
}));

export default router;
