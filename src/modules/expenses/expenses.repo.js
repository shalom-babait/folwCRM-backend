import pool from '../../services/database.js';

// יצירת הוצאה
export async function createExpense(expenseData) {
  const sql = `INSERT INTO expenses (organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  const { organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes } = expenseData;
  const [result] = await pool.query(sql, [organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes]);
  return { expense_id: result.insertId, ...expenseData };
}

// שליפת כל ההוצאות
export async function getAllExpenses() {
  const sql = 'SELECT * FROM expenses';
  const [rows] = await pool.query(sql);
  return rows;
}

// שליפת הוצאה לפי מזהה
export async function getExpenseById(expense_id) {
  const sql = 'SELECT * FROM expenses WHERE expense_id = ?';
  const [rows] = await pool.query(sql, [expense_id]);
  return rows[0];
}

// עדכון הוצאה
export async function updateExpense(expense_id, updateData) {
  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);
  const sql = `UPDATE expenses SET ${fields} WHERE expense_id = ?`;
  await pool.query(sql, [...values, expense_id]);
  return { expense_id, ...updateData };
}

// מחיקת הוצאה
export async function deleteExpense(expense_id) {
  const sql = 'DELETE FROM expenses WHERE expense_id = ?';
  await pool.query(sql, [expense_id]);
  return { expense_id };
}
