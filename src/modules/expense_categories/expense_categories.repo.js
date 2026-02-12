import pool from '../../services/database.js';

// יצירת קטגוריה
export async function createExpenseCategory(categoryData) {
  const sql = `INSERT INTO expense_categories (organization_id, category_name, description, is_active, created_at)
    VALUES (?, ?, ?, ?, NOW())`;
  const { organization_id, category_name, description, is_active } = categoryData;
  const [result] = await pool.query(sql, [organization_id, category_name, description, is_active]);
  return { expense_category_id: result.insertId, ...categoryData };
}

// שליפת כל הקטגוריות
export async function getAllExpenseCategories() {
  const sql = 'SELECT * FROM expense_categories';
  const [rows] = await pool.query(sql);
  return rows;
}

// שליפת קטגוריה לפי מזהה
export async function getExpenseCategoryById(expense_category_id) {
  const sql = 'SELECT * FROM expense_categories WHERE expense_category_id = ?';
  const [rows] = await pool.query(sql, [expense_category_id]);
  return rows[0];
}

// עדכון קטגוריה
export async function updateExpenseCategory(expense_category_id, updateData) {
  const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);
  const sql = `UPDATE expense_categories SET ${fields} WHERE expense_category_id = ?`;
  await pool.query(sql, [...values, expense_category_id]);
  return { expense_category_id, ...updateData };
}

// מחיקת קטגוריה
export async function deleteExpenseCategory(expense_category_id) {
  const sql = 'DELETE FROM expense_categories WHERE expense_category_id = ?';
  await pool.query(sql, [expense_category_id]);
  return { expense_category_id };
}
