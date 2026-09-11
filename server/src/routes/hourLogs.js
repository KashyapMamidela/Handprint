import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { wrap } from '../lib/wrap.js';

const router = Router();
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOAD_ROOT, String(req.user.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    cb(ok ? null : new Error('Only images and PDFs are allowed.'), ok);
  },
});

router.get('/mine', requireAuth, wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT hl.*, d.name AS drive_name, d.org AS drive_org
     FROM hour_logs hl JOIN drives d ON d.id = hl.drive_id
     WHERE hl.student_id = ?
     ORDER BY hl.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}));

router.post('/', requireAuth, (req, res, next) => {
  upload.single('proof')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ error: uploadErr.message });

    try {
      const { drive_id, hours, description } = req.body;
      if (!drive_id || !hours) return res.status(400).json({ error: 'Drive and hours are required.' });

      const proofPath = req.file ? `${req.user.id}/${req.file.filename}` : null;
      const [result] = await pool.query(
        `INSERT INTO hour_logs (student_id, drive_id, hours, description, proof_path)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, drive_id, hours, description || null, proofPath]
      );

      req.app.get('io').emit('queueUpdated');

      const [[log]] = await pool.query('SELECT * FROM hour_logs WHERE id = ?', [result.insertId]);
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  });
});

router.get('/queue', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT hl.*, d.name AS drive_name, d.org AS drive_org, u.name AS student_name
     FROM hour_logs hl
     JOIN drives d ON d.id = hl.drive_id
     JOIN users u ON u.id = hl.student_id
     WHERE hl.status = 'pending'
     ORDER BY hl.created_at DESC`
  );
  res.json(rows);
}));

router.patch('/:id/verify', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const { action, reason } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject.' });
  }

  const [[log]] = await pool.query('SELECT * FROM hour_logs WHERE id = ?', [req.params.id]);
  if (!log) return res.status(404).json({ error: 'Submission not found.' });

  const status = action === 'approve' ? 'approved' : 'rejected';
  await pool.query(
    `UPDATE hour_logs SET status = ?, verified_by = ?, verified_at = NOW(), rejection_reason = ? WHERE id = ?`,
    [status, req.user.id, action === 'reject' ? reason || '' : null, req.params.id]
  );

  const [[updated]] = await pool.query('SELECT * FROM hour_logs WHERE id = ?', [req.params.id]);

  const io = req.app.get('io');
  io.to(`student:${updated.student_id}`).emit('hourLogUpdated', updated);
  io.emit('leaderboardUpdated');
  io.emit('queueUpdated');

  res.json(updated);
}));

router.get('/:id/proof', requireAuth, wrap(async (req, res) => {
  const [[log]] = await pool.query('SELECT * FROM hour_logs WHERE id = ?', [req.params.id]);
  if (!log || !log.proof_path) return res.status(404).json({ error: 'No proof file found.' });

  const isOwner = log.student_id === req.user.id;
  const isStaff = req.user.role === 'admin';
  if (!isOwner && !isStaff) return res.status(403).json({ error: 'Not permitted.' });

  res.sendFile(path.join(UPLOAD_ROOT, log.proof_path));
}));

export default router;
