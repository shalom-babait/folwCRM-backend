// קבלת רשימת שיוכים לפי מזהה משימה
export async function getAssignmentsByTaskId(task_id) {
	const [rows] = await pool.query('SELECT entity_id, entity_type, role, created_at FROM task_assignments WHERE task_id = ?', [task_id]);
	return rows;
}

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
	const newTask = { ...task, task_id: result.insertId };
	// הוספת שיוכים אם קיימים
	if (Array.isArray(task.assignments) && task.assignments.length > 0) {
		await insertTaskAssignments(newTask.task_id, task.assignments);
	}
	return newTask;
}

// מחיקת משימה
export async function deleteTask(task_id) {
	const sql = `DELETE FROM tasks WHERE task_id = ?`;
	await pool.query(sql, [task_id]);
	return true;
}

// עדכון משימה (ללא assignmentTherapist/assignmentPatient/assignments)
export async function updateTask(task_id, updateData) {
	const fields = [];
	const values = [];
	// עדכון אוטומטי של updated_at
	const now = new Date();
	for (const key in updateData) {
		if (key === 'assignmentTherapist' || key === 'assignmentPatient' || key === 'assignments' || key === 'updated_at') continue;
		let value = updateData[key];
		if (key === 'due_date') {
			value = toDateOnly(value);
		}
		if (key === 'created_at' || key === 'completed_at') {
			value = toDateTime(value);
		}
		fields.push(`${key} = ?`);
		values.push(value);
	}
	// הוספת updated_at עם הזמן הנוכחי
	fields.push('updated_at = ?');
	values.push(toDateTime(now));
	if (fields.length === 0) return false;
	values.push(task_id);
	const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE task_id = ?`;
	const [result] = await pool.query(sql, values);
	return result.affectedRows > 0;
}

// מחיקת כל השיוכים של משימה
async function deleteTaskAssignments(task_id) {
	await pool.query('DELETE FROM task_assignments WHERE task_id = ?', [task_id]);
}

// הוספת שיוכים חדשים (תמיד עובד גם לשיוך בודד)
async function insertTaskAssignments(task_id, assignments) {
	if (!Array.isArray(assignments) || assignments.length === 0) return;
	const sql = `INSERT INTO task_assignments (task_id, entity_id, entity_type, role, created_at) VALUES (?, ?, ?, ?, ?)`;
	const now = new Date();
	for (const a of assignments) {
		await pool.query(sql, [
			task_id,
			a.entity_id || null,
			a.entity_type,
			a.role || null,
			now
		]);
	}
}

// קבלת השיוכים הקיימים למשימה
async function getTaskAssignments(task_id) {
	const [rows] = await pool.query('SELECT entity_id, entity_type FROM task_assignments WHERE task_id = ?', [task_id]);
	return rows;
}

// עדכון משימה כולל סנכרון שיוכים
export async function updateTaskWithAssignments(task_id, updateData) {
	await updateTask(task_id, updateData);
	if (!Array.isArray(updateData.assignments)) return true;

	// שליפת השיוכים הקיימים
	const existing = await getTaskAssignments(task_id);
	// יצירת סטים להשוואה
	const existingSet = new Set(existing.map(a => `${a.entity_type}:${a.entity_id}`));
	const incomingSet = new Set(updateData.assignments.map(a => `${a.entity_type}:${a.entity_id}`));

	// שיוכים להוספה (בפרונט ולא קיימים)
	const toAdd = updateData.assignments.filter(a => !existingSet.has(`${a.entity_type}:${a.entity_id}`));
	// שיוכים למחיקה (קיימים בטבלה ולא הגיעו מהפרונט)
	const toDelete = existing.filter(a => !incomingSet.has(`${a.entity_type}:${a.entity_id}`));

	// הוספה
	if (toAdd.length > 0) {
		await insertTaskAssignments(task_id, toAdd);
	}
	// מחיקה
	for (const a of toDelete) {
		await pool.query('DELETE FROM task_assignments WHERE task_id = ? AND entity_id = ? AND entity_type = ?', [task_id, a.entity_id, a.entity_type]);
	}
	// לא נוגעים בשיוכים שכבר קיימים והגיעו מהפרונט
	return true;
}

// קבלת רשימת משימות לפי מזהה מטופל
export async function getTasksByPatientId(patient_id) {
	const sql = `SELECT * FROM tasks WHERE patient_id = ? ORDER BY due_date DESC, created_at DESC`;
	const [rows] = await pool.query(sql, [patient_id]);
	// הוספת מערך שיוכים לכל משימה
	for (const task of rows) {
		task.assignments = await getAssignmentsByTaskId(task.task_id);
	}
	return rows;
}
