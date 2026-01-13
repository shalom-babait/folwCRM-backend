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
  let { appointment_id, amount, payment_date, method, status, transaction_type, patient_id, therapist_id } = paymentData;

  const formattedDate = toMysqlLocalDatetime(payment_date);

  // 1. שליפת person_id לפי patient_id
  const personSql = `
    SELECT person_id 
    FROM patients 
    WHERE patient_id = ?
  `;
  const [personResult] = await pool.query(personSql, [patient_id]);

  if (personResult.length === 0) {
    throw new Error('No person found for the given patient_id');
  }

  const person_id = personResult[0].person_id;

  // 2. שמירת התשלום בטבלת payments
  const sql = `
    INSERT INTO payments 
      (appointment_id, amount, payment_date, method, status, transaction_type, person_id, therapist_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    appointment_id,
    amount,
    formattedDate,
    method,
    status || 'pending',
    transaction_type,
    person_id,
    therapist_id
  ];

  const [result] = await pool.query(sql, params);

  // הדפסה ללוג
  // console.log('createPayment result:', { payment_id: result.insertId, ...paymentData, person_id });

  return { payment_id: result.insertId, ...paymentData, person_id };
}

// --- שליפות CRUD ---

export async function getAllPayments() {
  const [rows] = await pool.query(`SELECT * FROM payments`);
  return rows;
}

export async function getPaymentById(payment_id) {
  const [rows] = await pool.query(`SELECT * FROM payments WHERE payment_id = ?`, [payment_id]);
  return rows[0];
}

export async function getPaymentByPatientId(patient_id) {
  const sql = `
    SELECT p.*
    FROM payments p
    JOIN patients pa ON p.person_id = pa.person_id
    WHERE pa.patient_id = ?
    ORDER BY p.payment_date DESC
  `;

  const [rows] = await pool.query(sql, [patient_id]);
  return rows;
}

export async function updatePayment(payment_id, paymentData) {
  const fields = Object.keys(paymentData)
    .map(key => `${key} = ?`)
    .join(', ');

  const values = Object.values(paymentData);
  await pool.query(
    `UPDATE payments SET ${fields} WHERE pay_id = ?`,
    [...values, payment_id]
  );
  
}

export async function deletePayment(payment_id) {
  await pool.query(`DELETE FROM payments WHERE payment_id = ?`, [payment_id]);
}

/**
 * מוחק תשלום לפי מזהה
 * @param {number} payment_id
 */
export async function deletePaymentById(payment_id) {
  await pool.query(`DELETE FROM payments WHERE payment_id = ?`, [payment_id]);
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
export async function getTherapistMonthlyPaymentsList(therapistId) {
  // console.log('getTherapistMonthlyPaymentsList therapistId:', therapistId);
  // 1. כל התשלומים של המטפל החודש
  const [payments] = await pool.query(`
    SELECT * FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
      AND status = 'paid'
  `, [therapistId]);
  // console.log('שלב 1 - payments:', payments);

  // 2. כל הפציינטים של המטפל שיש להם תשלום החודש
  const [patients] = await pool.query(`
    SELECT DISTINCT person_id FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
      AND status = 'paid'
  `, [therapistId]);
  // console.log('שלב 2 - patients:', patients);

  // 3. שמות הפציינטים
  if (patients.length > 0) {
    const personIds = patients.map(p => p.person_id);
    const [names] = await pool.query(`
      SELECT person_id, first_name, last_name FROM person WHERE person_id IN (${personIds.map(() => '?').join(',')})
    `, personIds);
    // console.log('שלב 3 - names:', names);
  } else {
    // console.log('שלב 3 - אין פציינטים');
  }

  // 4. השאילתה הסופית
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
  // console.log('שלב 4 - getTherapistMonthlyPaymentsList result:', rows);
  return rows;
}
