
// קבלת רשימת משימות לפי מזהה יוזר
export async function getTasksByUserId(req, res) {
	try {
		console.log('[controller] קבלת משימות לפי יוזר:', req.params.user_id);
		const tasks = await getTasksByUserIdService(req.params.user_id);
		console.log('[controller] משימות שנמצאו:', tasks);
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
		console.log('התקבלה בקשה להוספת משימה:', req.body);
		const task = await addTaskService(req.body);
		console.log('משימה נוספה בהצלחה:', task);
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
		console.log('בקשת עדכון משימה:', task_id, req.body);
		const updated = await updateTaskService(task_id, req.body);
		if (!updated) {
			console.log('עדכון משימה - לא נמצאה משימה או לא בוצע שינוי');
			return res.status(404).json({ error: 'Not found or no changes' });
		}
		console.log('משימה עודכנה בהצלחה:', task_id);
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
