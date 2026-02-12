import { createExpenseCategoryService, getAllExpenseCategoriesService, getExpenseCategoryByIdService, updateExpenseCategoryService, deleteExpenseCategoryService } from './expense_categories.service.js';

// יצירת קטגוריה
export async function createExpenseCategoryController(req, res) {
  try {
    const category = await createExpenseCategoryService(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// שליפת כל הקטגוריות
export async function getAllExpenseCategoriesController(req, res) {
  try {
    const categories = await getAllExpenseCategoriesService();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// שליפת קטגוריה לפי מזהה
export async function getExpenseCategoryByIdController(req, res) {
  try {
    const category = await getExpenseCategoryByIdService(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// עדכון קטגוריה
export async function updateExpenseCategoryController(req, res) {
  try {
    const updated = await updateExpenseCategoryService(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// מחיקת קטגוריה
export async function deleteExpenseCategoryController(req, res) {
  try {
    await deleteExpenseCategoryService(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
