import express from 'express';
import {
  createPersonController,
  getAllPersonsController,
  getPersonByIdController,
  updatePersonController,
  deletePersonController
} from './person.controller.js';

const router = express.Router();

// יצירת פרסון
router.post('/create', createPersonController);
// שליפת כל הפרסונים
router.get('/getAll', getAllPersonsController);
// שליפת פרסון לפי מזהה
router.get('/:person_id', getPersonByIdController);
// עדכון פרסון
router.put('/update/:person_id', updatePersonController);
// מחיקת פרסון
router.delete('/delete/:person_id', deletePersonController);

export default router;
