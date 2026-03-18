import express from 'express';

import {
  createExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  deleteExpenseController
} from './expenses.controller.js';

import {
  createExpenseCategoryController,
  getAllExpenseCategoriesController,
  getExpenseCategoryByIdController,
  updateExpenseCategoryController,
  deleteExpenseCategoryController
} from '../expense_categories/expense_categories.controller.js';

const router = express.Router();

// ======= נתיבי קטגוריות (חייבים להיות לפני :id) =======
router.get('/categories', getAllExpenseCategoriesController);
router.post('/categories', createExpenseCategoryController);

// ======= נתיבי הוצאות =======
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