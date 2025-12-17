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
  let { appointment_id, amount, payment_date, method, status, transaction_type, patient_id } = paymentData;

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
      (appointment_id, amount, payment_date, method, status, transaction_type, person_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    appointment_id,
    amount,
    formattedDate,
    method,
    status || 'pending',
    transaction_type,
    person_id
  ];

  const [result] = await pool.query(sql, params);

  return { payment_id: result.insertId, ...paymentData };
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
  await pool.query(`UPDATE payments SET ${fields} WHERE payment_id = ?`, [...values, payment_id]);
  return getPaymentById(payment_id);
}

export async function deletePayment(payment_id) {
  await pool.query(`DELETE FROM payments WHERE payment_id = ?`, [payment_id]);
}
