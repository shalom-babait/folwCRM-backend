import express from 'express';
import {
  createExpenseCategoryController,
  getAllExpenseCategoriesController,
  getExpenseCategoryByIdController,
  updateExpenseCategoryController,
  deleteExpenseCategoryController
} from './expense_categories.controller.js';

const router = express.Router();

// יצירת קטגוריה
router.post('/create', createExpenseCategoryController);
// שליפת כל הקטגוריות
router.get('/all', getAllExpenseCategoriesController);
// שליפת קטגוריה בודדת
router.get('/:id', getExpenseCategoryByIdController);
// עדכון קטגוריה
router.put('/:id', updateExpenseCategoryController);
// מחיקת קטגוריה
router.delete('/:id', deleteExpenseCategoryController);

export default router;
