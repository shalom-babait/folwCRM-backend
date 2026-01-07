
import pool from '../../services/database.js';

// פונקציה לעיבוד תאריכים לפורמט YYYY-MM-DD
function toDateOnly(dateStr) {
	if (!dateStr) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 10);
}

// פונקציה לעיבוד תאריכים לפורמט DATETIME (YYYY-MM-DD HH:MM:SS)
function toDateTime(dateStr) {
	if (!dateStr) return null;
	// אם זה כבר בפורמט DATETIME
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) return dateStr;
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return null;
	// הפורמט של MySQL DATETIME
	return d.toISOString().slice(0, 19).replace('T', ' ');
}

// הוספת משימה
export async function addTask(task) {
	const sql = `INSERT INTO tasks (title, description, patient_id, created_by_user_id, assigned_to_user_id, status, priority, due_date, completed_at, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
	const [result] = await pool.query(sql, [
		task.title,
		task.description || null,
		task.patient_id || null,
		task.created_by_user_id,
		task.assigned_to_user_id,
		task.status,
		task.priority || null,
		toDateOnly(task.due_date) || null,
		toDateTime(task.completed_at) || null,
		task.color || null
	]);
	return { ...task, task_id: result.insertId };
}

// מחיקת משימה
export async function deleteTask(task_id) {
	const sql = `DELETE FROM tasks WHERE task_id = ?`;
	await pool.query(sql, [task_id]);
	return true;
}

// עדכון משימה
export async function updateTask(task_id, updateData) {
	const fields = [];
	const values = [];
	for (const key in updateData) {
		let value = updateData[key];
		if (key === 'due_date') {
			value = toDateOnly(value);
		}
		if (key === 'created_at' || key === 'updated_at' || key === 'completed_at') {
			value = toDateTime(value);
		}
		fields.push(`${key} = ?`);
		values.push(value);
	}
	if (fields.length === 0) return false;
	values.push(task_id);
	const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE task_id = ?`;
	const [result] = await pool.query(sql, values);
	return result.affectedRows > 0;
}

// קבלת רשימת משימות לפי מזהה מטופל
export async function getTasksByPatientId(patient_id) {
	const sql = `SELECT * FROM tasks WHERE patient_id = ? ORDER BY due_date DESC, created_at DESC`;
	const [rows] = await pool.query(sql, [patient_id]);
	return rows;
}
