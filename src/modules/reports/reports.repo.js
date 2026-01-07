// דוח חובות פתוחים למטפל
export async function getOpenDebtsByTherapist(therapist_id) {
  const sql = `
    SELECT
        p.person_id,
        p.first_name AS patient_name,
        SUM(
            CASE 
                WHEN pay.transaction_type = 'debit' THEN pay.amount
                WHEN pay.transaction_type = 'credit' THEN -pay.amount
                ELSE 0
            END
        ) AS open_balance
    FROM payments pay
    JOIN person p ON p.person_id = pay.person_id
    WHERE pay.therapist_id = ?
    GROUP BY p.person_id, p.first_name
    HAVING open_balance > 0
    ORDER BY p.first_name
  `;
  const [rows] = await pool.query(sql, [therapist_id]);
  console.log('[getOpenDebtsByTherapist] rows:', rows);
  return rows;
}
import pool from '../../services/database.js';

export async function createReport(reportData) {
  const { title, content, created_by, created_at } = reportData;
  const [result] = await pool.query(
    `INSERT INTO reports (title, content, created_by, created_at) VALUES (?, ?, ?, ?)`,
    [title, content, created_by, created_at]
  );
  return { report_id: result.insertId, ...reportData };
}

export async function getAllReports() {
  const [rows] = await pool.query(`SELECT * FROM reports`);
  return rows;
}

export async function getReportById(report_id) {
  const [rows] = await pool.query(`SELECT * FROM reports WHERE report_id = ?`, [report_id]);
  return rows[0] || null;
}

export async function updateReport(report_id, reportData) {
  const fields = Object.keys(reportData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(reportData);
  const [result] = await pool.query(`UPDATE reports SET ${fields} WHERE report_id = ?`, [...values, report_id]);
  if (result.affectedRows === 0) return null;
  return getReportById(report_id);
}

export async function deleteReport(report_id) {
  const [result] = await pool.query(`DELETE FROM reports WHERE report_id = ?`, [report_id]);
  return result.affectedRows > 0;
}
