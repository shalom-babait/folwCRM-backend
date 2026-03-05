// דוח הכנסות 12 חודשים אחורה עד חודש ושנה שנבחרו
export async function getMonthlyIncomeLast12({ year, month, organization_id }) {
  // month: 1-12 (JS: 0-11, כאן 1-12)
  // נחשב את התאריכים
  const endDate = new Date(year, month - 1, 1); // JS month 0-based
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 11);
  // פורמט תאריכים ל-YYYY-MM-01
  function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  // שלוף סכום הכנסות לכל חודש בטווח
  const sql = `
    SELECT YEAR(payment_date) AS y, MONTH(payment_date) AS m, SUM(amount) AS total
    FROM payments
    WHERE payment_date >= ? AND payment_date < DATE_ADD(?, INTERVAL 1 MONTH)
      AND status = 'paid'
      AND organization_id = ?
    GROUP BY y, m
    ORDER BY y, m
  `;
  const [rows] = await pool.query(sql, [start, end, organization_id]);
  // בנה מערך 12 חודשים אחורה
  const monthlyIncome = [];
  let cur = new Date(startDate);
  for (let i = 0; i < 12; i++) {
    const y = cur.getFullYear();
    const m = cur.getMonth() + 1;
    const found = rows.find(r => r.y === y && r.m === m);
    monthlyIncome.push(found ? Number(found.total) : 0);
    cur.setMonth(cur.getMonth() + 1);
  }
  return { monthlyIncome };
}

// דוח הכנסות לפי חודשים ושנה
// דוח הכנסות לפי חודשים ושנה ומטפל
export async function getIncomeReportByMonthsAndYear({ year, months, organization_id, therapist_id }) {
  try {
    if (!year || !Array.isArray(months) || months.length === 0) {
      return [];
    }
    const placeholders = months.map(() => '?').join(',');
    const sql = `
      SELECT 
        MONTH(payment_date) AS month,
        p.person_id,
        CONCAT(p.first_name, ' ', p.last_name) AS client_name,
        SUM(amount) AS client_total
      FROM payments pay
      JOIN person p ON pay.person_id = p.person_id
      WHERE YEAR(payment_date) = ?
        AND MONTH(payment_date) IN (${placeholders})
        AND pay.status = 'paid'
        AND pay.organization_id = ?
        AND pay.therapist_id = ?
      GROUP BY MONTH(payment_date), p.person_id
      ORDER BY month, client_name
    `;
    const params = [year, ...months.map(m => m + 1), organization_id, therapist_id];
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
  } catch (err) {
    console.error('[income-report] ERROR:', err && err.message, err && err.stack);
    throw err;
  }
}
// דוח חובות פתוחים למטפל
export async function getOpenDebtsByTherapist(therapist_id, organization_id) {
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
    AND pay.organization_id = ?
  GROUP BY p.person_id, p.first_name
  HAVING open_balance > 0
  ORDER BY p.first_name
  `;
  const [rows] = await pool.query(sql, [therapist_id, organization_id]);
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
