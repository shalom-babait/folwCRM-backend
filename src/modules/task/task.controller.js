
// קבלת רשימת משימות לפי מזהה יוזר
export async function getTasksByUserId(req, res) {
	try {
		const tasks = await getTasksByUserIdService(req.params.user_id);
		res.json(tasks);
	} catch (err) {
		console.error('[controller] שגיאה בשליפת משימות לפי יוזר:', err);
		res.status(500).json({ error: err.message });
	}
}
import { addTaskService, deleteTaskService, updateTaskService, getTasksByPatientIdService, getTasksByUserIdService } from './task.service.js';

// הוספת משימה
export async function addTask(req, res) {
	try {
		const task = await addTaskService(req.body);
		res.status(201).json(task);
	} catch (err) {
		console.error('שגיאה בהוספת משימה:', err);
		res.status(500).json({ error: err.message });
	}
}

// מחיקת משימה
export async function deleteTask(req, res) {
	try {
		const { task_id } = req.params;
		await deleteTaskService(task_id);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// עדכון משימה
export async function updateTask(req, res) {
	try {
		const { task_id } = req.params;
		const updated = await updateTaskService(task_id, req.body);
		if (!updated) {
			return res.status(404).json({ error: 'Not found or no changes' });
		}
		res.json({ success: true });
	} catch (err) {
		console.error('שגיאה בעדכון משימה:', err);
		res.status(500).json({ error: err.message });
	}
}

// קבלת רשימת משימות לפי מזהה מטופל
export async function getTasksByPatientId(req, res) {
	try {
		const { patient_id } = req.params;
		const tasks = await getTasksByPatientIdService(patient_id);
		res.json(tasks);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
