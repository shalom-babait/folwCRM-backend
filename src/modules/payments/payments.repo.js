import pool from '../../services/database.js';

export async function createPayment(paymentData) {
  const { appointment_id, amount,payment_date, method, status,transaction_type } = paymentData;
  const [result] = await pool.query(
    `INSERT INTO Payments (appointment_id, amount,payment_date, method, status,transaction_type) VALUES (?,?, ?, ?, ?,?)`,
    [appointment_id, amount,payment_date, method, status || 'pending',transaction_type]
  );
  return { pay_id: result.insertId, ...paymentData };
}

export async function getAllPayments() {
  const [rows] = await pool.query(`SELECT * FROM Payments`);
  return rows;
}

export async function getPaymentById(patient_id) {
  const [rows] = await pool.query(`SELECT * FROM Payments WHERE pay_id = ?`, [pay_id]);
  return rows[0];
}

export async function getPaymentByPatientId(patient_id) {
  const [rows] = await pool.query(
    `SELECT p.* 
     FROM Payments p
     JOIN Appointments a ON p.appointment_id = a.appointment_id
     WHERE a.patient_id = ?`,
    [patient_id]
  );
  // console.log(rows);
  
  return rows;
}


export async function updatePayment(pay_id, paymentData) {
  const fields = Object.keys(paymentData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(paymentData);
  await pool.query(`UPDATE Payments SET ${fields} WHERE pay_id = ?`, [...values, pay_id]);
  return getPaymentById(pay_id);
}

export async function deletePayment(pay_id) {
  await pool.query(`DELETE FROM Payments WHERE pay_id = ?`, [pay_id]);
}
