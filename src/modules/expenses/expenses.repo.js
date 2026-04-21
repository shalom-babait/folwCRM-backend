import pool from '../../services/database.js';

// יצירת הוצאה
export async function createExpense(expenseData) {
  const sql = `INSERT INTO expenses (organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes, other_category_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  const { organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes, other_category_name } = expenseData;
  const [result] = await pool.query(sql, [organization_id, expense_category_id, person_id, amount, payment_date, payment_method, reference_number, notes, other_category_name]);
  return { expense_id: result.insertId, ...expenseData };
}

// שליפת כל ההוצאות
export async function getAllExpenses(organizationId = null) {
  let sql = 'SELECT * FROM expenses';
  const params = [];
  
  if (organizationId) {
    sql += ' WHERE organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

// שליפת הוצאה לפי מזהה
export async function getExpenseById(expense_id, organizationId = null) {
  let sql = 'SELECT * FROM expenses WHERE expense_id = ?';
  const params = [expense_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.query(sql, params);
  return rows[0];
}

// עדכון הוצאה
export async function updateExpense(expense_id, updateData, organizationId = null) {
  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);
  let sql = `UPDATE expenses SET ${fields} WHERE expense_id = ?`;
  const params = [...values, expense_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  await pool.query(sql, params);
  return { expense_id, ...updateData };
}

// מחיקת הוצאה
export async function deleteExpense(expense_id, organizationId = null) {
  let sql = 'DELETE FROM expenses WHERE expense_id = ?';
  const params = [expense_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  await pool.query(sql, params);
  return { expense_id };
}
