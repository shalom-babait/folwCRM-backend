
import express from 'express';
import {
	createTreatmentTypeController,
	deleteTreatmentTypeController,
	updateTreatmentTypeController,
	getAllTreatmentTypesController
} from './treatmentType.controller.js';

const router = express.Router();

// הוספה
router.post('/create', createTreatmentTypeController);
// קבלת כל הרשימה
router.get('/getAll', getAllTreatmentTypesController);
// עדכון לפי ID
router.put('/update/:id', updateTreatmentTypeController);
// מחיקה לפי ID
router.delete('/delete/:id', deleteTreatmentTypeController);

export default router;
