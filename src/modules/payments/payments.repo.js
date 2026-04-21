import pool from '../../services/database.js';

// ממיר Date לשעה המקומית (ישראל) בפורמט MySQL
function toMysqlLocalDatetime(date) {
  if (!date) return null;

  const d = new Date(date);
  const offsetMS = d.getTimezoneOffset() * 60 * 1000;
  const local = new Date(d.getTime() - offsetMS);

  return local.toISOString().slice(0, 19).replace('T', ' ');
}

export async function createPayment(paymentData) {
  let { appointment_id, amount, payment_date, method, status, transaction_type, person_id, therapist_id, organization_id } = paymentData;

  // רק אם לא הגיע therapist_id, ננסה למצוא אותו לפי person_id
  if (!therapist_id && person_id) {
    const [therapists] = await pool.query(
      'SELECT therapist_id FROM therapists WHERE person_id = ?',
      [person_id]
    );
    
    if (therapists.length > 0) {
      therapist_id = therapists[0].therapist_id;
    }
  }
  
  // אם זו הכנסה ישירה (יש therapist_id אבל person_id מצביע על מטפל) - נאפס את person_id
  if (therapist_id && person_id) {
    person_id = null;
  }

  // person_id אופציונלי - הכנסה ישירה לא חייבת להיות קשורה למטופל ספציפי

  const formattedDate = toMysqlLocalDatetime(payment_date);

  const sql = `
    INSERT INTO payments 
      (appointment_id, amount, payment_date, method, status, transaction_type, person_id, therapist_id, organization_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    appointment_id,
    amount,
    formattedDate,
    method,
    status || 'pending',
    transaction_type,
    person_id,
    therapist_id,
    organization_id || null
  ];

  const [result] = await pool.query(sql, params);
  return { payment_id: result.insertId, ...paymentData };
}

// --- שליפות CRUD ---

export async function getAllPayments(organizationId = null) {
  let sql = `SELECT * FROM payments`;
  const params = [];
  
  if (organizationId) {
    sql += ' WHERE organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function getPaymentById(payment_id, organizationId = null) {
  let sql = `SELECT * FROM payments WHERE payment_id = ?`;
  const params = [payment_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.query(sql, params);
  return rows[0];
}

export async function getPaymentByPatientId(patient_id, organizationId = null) {
  let sql = `
    SELECT p.*
    FROM payments p
    JOIN patients pa ON p.person_id = pa.person_id
    WHERE pa.patient_id = ?`;
  
  const params = [patient_id];
  
  if (organizationId) {
    sql += ' AND p.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY p.payment_date DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function updatePayment(payment_id, paymentData, organizationId = null) {
  const fields = Object.keys(paymentData)
    .map(key => `${key} = ?`)
    .join(', ');

  const values = Object.values(paymentData);
  
  let sql = `UPDATE payments SET ${fields} WHERE payment_id = ?`;
  const params = [...values, payment_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  await pool.query(sql, params);
}

export async function deletePayment(payment_id, organizationId = null) {
  let sql = `DELETE FROM payments WHERE payment_id = ?`;
  const params = [payment_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  await pool.query(sql, params);
}

/**
 * מוחק תשלום לפי מזהה
 * @param {number} payment_id
 */
export async function deletePaymentById(payment_id, organizationId = null) {
  let sql = `DELETE FROM payments WHERE payment_id = ?`;
  const params = [payment_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  await pool.query(sql, params);
}

/**
 * מחזיר את סכום התשלומים למטפל עבור חודש ושנה מסוימים
 * @param {number} therapistId - מזהה המטפל
 * @param {number} month - מספר החודש (1-12)
 * @param {number} year - מספר השנה (YYYY)
 * @returns {Promise<number>} סכום התשלומים
 */
export async function getTherapistPaymentsSumByMonth(therapistId, month, year) {
  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total_payments
    FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = ?
      AND YEAR(payment_date) = ?
      AND status = 'paid'
  `;
  const [rows] = await pool.query(sql, [therapistId, month, year]);
  return rows[0].total_payments;
}

/**
 * מחזיר רשימת תשלומים של מטפל לחודש הנוכחי: שם לקוח וסך הכל תשלומים לכל לקוח
 * @param {number} therapistId
 * @returns {Promise<Array<{patient_name: string, total_payments: number}>>}
 */
export async function getTherapistMonthlyPaymentsList(therapistId, organizationId = null) {
  // כל התשלומים של המטפל החודש
  let sql1 = `
    SELECT * FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
      AND status = 'paid'`;
  
  const params1 = [therapistId];
  
  if (organizationId) {
    sql1 += ' AND organization_id = ?';
    params1.push(organizationId);
  }
  
  const [payments] = await pool.query(sql1, params1);

  // כל הפציינטים של המטפל שיש להם תשלום החודש
  let sql2 = `
    SELECT DISTINCT person_id FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
      AND status = 'paid'`;
  
  const params2 = [therapistId];
  
  if (organizationId) {
    sql2 += ' AND organization_id = ?';
    params2.push(organizationId);
  }
  
  const [patients] = await pool.query(sql2, params2);

  // שמות הפציינטים
  if (patients.length > 0) {
    const personIds = patients.map(p => p.person_id);
    const [names] = await pool.query(`
      SELECT person_id, first_name, last_name FROM person WHERE person_id IN (${personIds.map(() => '?').join(',')})
    `, personIds);
  }

  // השאילתה הסופית
  const sql = `
    SELECT 
      CONCAT(per.first_name, ' ', per.last_name) AS patient_name,
      IFNULL(SUM(p.amount), 0) AS total_payments
    FROM payments p
    INNER JOIN patients pa ON p.person_id = pa.person_id
    INNER JOIN person per ON pa.person_id = per.person_id
    WHERE p.therapist_id = ?
      AND MONTH(p.payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())
      AND p.status = 'paid'
    GROUP BY pa.patient_id
    ORDER BY patient_name
  `;
  const [rows] = await pool.query(sql, [therapistId]);
  return rows;
}

/**
 * מחזיר תנועות כספיות משולבות (הכנסות + הוצאות) לפי person_id וחודש
 * @param {number} personId - מזהה האדם
 * @param {number} month - מספר החודש (1-12)
 * @param {number} year - מספר השנה (YYYY)
 * @param {number} organizationId - מזהה הארגון
 * @returns {Promise<{transactions: Array, summary: {totalIncome: number, totalExpense: number, balance: number}}>}
 */
export async function getFinancialTransactionsByMonth(personId, month, year, organizationId) {
  // שליפת הכנסות (payments) - לפי therapist_id שמקושר ל-person_id של המטפל
  const incomesSql = `
    SELECT 
      p.payment_id AS id,
      'income' AS type,
      p.amount,
      p.payment_date AS date,
      p.method,
      CASE 
        WHEN pa.person_id IS NOT NULL THEN CONCAT(per.first_name, ' ', per.last_name)
        ELSE 'הכנסה ישירה'
      END AS details,
      'הכנסה מטיפול' AS category
    FROM payments p
    JOIN therapists t ON p.therapist_id = t.therapist_id
    LEFT JOIN patients pa ON p.person_id = pa.person_id
    LEFT JOIN person per ON pa.person_id = per.person_id
    WHERE t.person_id = ?
      AND MONTH(p.payment_date) = ?
      AND YEAR(p.payment_date) = ?
      AND p.organization_id = ?
      AND p.status = 'paid'
  `;
  
  // שליפת הוצאות (expenses) - לפי person_id של המטפל
  const expensesSql = `
    SELECT 
      expense_id AS id,
      'expense' AS type,
      amount,
      payment_date AS date,
      payment_method AS method,
      COALESCE(notes, '') AS details,
      COALESCE(ec.category_name, other_category_name, 'לא צוין') AS category
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.expense_category_id = ec.expense_category_id
    WHERE e.person_id = ?
      AND MONTH(e.payment_date) = ?
      AND YEAR(e.payment_date) = ?
      AND e.organization_id = ?
  `;
  
  // ביצוע שתי השאילתות
  const [incomes] = await pool.query(incomesSql, [personId, month, year, organizationId]);
  const [expenses] = await pool.query(expensesSql, [personId, month, year, organizationId]);
  
  // חישוב סיכומים
  const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // איחוד התנועות ומיון לפי תאריך
  const transactions = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return {
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    }
  };
}
