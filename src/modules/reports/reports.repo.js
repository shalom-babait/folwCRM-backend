
// דוח הכנסות לפי חודשים ושנה
export async function getIncomeReportByMonthsAndYear({ year, months }) {
  if (!year || !Array.isArray(months) || months.length === 0) return [];
  const placeholders = months.map(() => '?').join(',');
  // שלב 1: שלוף את כל התשלומים לפי חודשים ולקוחות
  const sql = `
    SELECT 
      MONTH(payment_date) AS month,
      p.person_id,
      CONCAT(p.first_name, ' ', p.last_name) AS client_name,
      SUM(amount) AS client_total
    FROM Payments pay
    JOIN person p ON pay.person_id = p.person_id
    WHERE YEAR(payment_date) = ?
      AND MONTH(payment_date) IN (${placeholders})
      AND pay.status = 'paid'
    GROUP BY MONTH(payment_date), p.person_id
    ORDER BY month, client_name
  `;
  const params = [year, ...months.map(m => m + 1)];
  const [rows] = await pool.query(sql, params);

  // שלב 2: ארגן את התוצאות למבנה נוח
  const result = [];
  for (const m of months) {
    const monthRows = rows.filter(r => r.month === m + 1);
    if (monthRows.length === 0) continue;
    const clients = monthRows.map(r => ({
      person_id: r.person_id,
      client_name: r.client_name,
      total: Number(r.client_total)
    }));
    const monthTotal = clients.reduce((sum, c) => sum + c.total, 0);
    result.push({
      month: m,
      clients,
      total: monthTotal
    });
  }
  return result;
}
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
