import pool from '../../services/database.js';

export async function createPayment(paymentData) {
  const { appointment_id, amount, method, status } = paymentData;
  const [result] = await pool.query(
    `INSERT INTO Payments (appointment_id, amount, method, status) VALUES (?, ?, ?, ?)`,
    [appointment_id, amount, method, status || 'pending']
  );
  return { pay_id: result.insertId, ...paymentData };
}

export async function getAllPayments() {
  const [rows] = await pool.query(`SELECT * FROM Payments`);
  return rows;
}

export async function getPaymentById(pay_id) {
  const [rows] = await pool.query(`SELECT * FROM Payments WHERE pay_id = ?`, [pay_id]);
  return rows[0];
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
