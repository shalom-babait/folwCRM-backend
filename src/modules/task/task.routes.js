import express from 'express';
import * as taskController from './task.controller.js';

const router = express.Router();

// הוספת משימה
router.post('/add-task', taskController.addTask);
// מחיקת משימה
router.delete('/:task_id', taskController.deleteTask);
// עדכון משימה
router.put('/:task_id', taskController.updateTask);
// קבלת רשימת משימות לפי מזהה מטופל
router.get('/by-patient/:patient_id', taskController.getTasksByPatientId);
export default router;
