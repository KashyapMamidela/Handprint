import { pool } from '../db.js';

// Computed on read from approved hour_logs, mirroring the Postgres view this
// replaced — no denormalized totals stored anywhere.
export async function getLeaderboard() {
  const [rows] = await pool.query(`
    SELECT u.id AS student_id, u.name, u.initials,
      COALESCE(SUM(CASE WHEN hl.status = 'approved' THEN hl.hours ELSE 0 END), 0) AS hours,
      COUNT(CASE WHEN hl.status = 'approved' THEN hl.id END) AS drives
    FROM users u
    LEFT JOIN hour_logs hl ON hl.student_id = u.id
    WHERE u.role = 'volunteer'
    GROUP BY u.id, u.name, u.initials
    ORDER BY hours DESC, u.name ASC
  `);
  return rows.map((r, i) => ({
    student_id: r.student_id,
    name: r.name,
    initials: r.initials,
    hours: Number(r.hours),
    drives: Number(r.drives),
    rank: i + 1,
  }));
}

export async function getStats() {
  const [[hoursRow]] = await pool.query(
    "SELECT COALESCE(SUM(hours), 0) AS total FROM hour_logs WHERE status = 'approved'"
  );
  const [[studentsRow]] = await pool.query(
    "SELECT COUNT(DISTINCT student_id) AS total FROM hour_logs WHERE status = 'approved'"
  );
  const [[drivesRow]] = await pool.query('SELECT COUNT(*) AS total FROM drives');
  return {
    hours: Number(hoursRow.total),
    students: Number(studentsRow.total),
    drives: Number(drivesRow.total),
  };
}
