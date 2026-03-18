import { createExpenseCategoryService, getAllExpenseCategoriesService, getExpenseCategoryByIdService, updateExpenseCategoryService, deleteExpenseCategoryService } from './expense_categories.service.js';
import logger from '../../config/logger.js';

// יצירת קטגוריה
export async function createExpenseCategoryController(req, res) {
  try {
    const organizationId = req.organization_id;
    const categoryData = {
      ...req.body,
      organization_id: organizationId
    };
    const category = await createExpenseCategoryService(categoryData);
    res.status(201).json(category);
  } catch (err) {
    logger.error('שגיאה ביצירת קטגוריית הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}

// שליפת כל הקטגוריות
export async function getAllExpenseCategoriesController(req, res) {
  try {
    const categories = await getAllExpenseCategoriesService();
    res.json(categories);
  } catch (err) {
    logger.error('שגיאה בשליפת קטגוריות הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}

// שליפת קטגוריה לפי מזהה
export async function getExpenseCategoryByIdController(req, res) {
  try {
    const category = await getExpenseCategoryByIdService(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    logger.error('שגיאה בשליפת קטגוריית הוצאה לפי מזהה:', err);
    res.status(500).json({ error: err.message });
  }
}

// עדכון קטגוריה
export async function updateExpenseCategoryController(req, res) {
  try {
    const updated = await updateExpenseCategoryService(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    logger.error('שגיאה בעדכון קטגוריית הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}

// מחיקת קטגוריה
export async function deleteExpenseCategoryController(req, res) {
  try {
    await deleteExpenseCategoryService(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    logger.error('שגיאה במחיקת קטגוריית הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}
