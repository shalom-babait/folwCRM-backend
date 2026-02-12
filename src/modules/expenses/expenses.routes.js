import express from 'express';

import {
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController
} from './expenses.controller.js';

const router = express.Router();

// יצירת הוצאה
router.post('/create', createExpenseController);
// שליפת כל ההוצאות
router.get('/all', getAllExpensesController);
// שליפת הוצאה בודדת
router.get('/:id', getExpenseByIdController);
// עדכון הוצאה
router.put('/:id', updateExpenseController);
// מחיקת הוצאה
router.delete('/:id', deleteExpenseController);

export default router;