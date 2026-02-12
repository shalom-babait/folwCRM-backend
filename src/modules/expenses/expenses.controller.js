import { createExpenseService, getAllExpensesService, getExpenseByIdService, updateExpenseService, deleteExpenseService } from './expenses.service.js';

// יצירת הוצאה
export async function createExpenseController(req, res) {
  try {
    const expense = await createExpenseService(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// שליפת כל ההוצאות
export async function getAllExpensesController(req, res) {
  try {
    const expenses = await getAllExpensesService();
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// שליפת הוצאה לפי מזהה
export async function getExpenseByIdController(req, res) {
  try {
    const expense = await getExpenseByIdService(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// עדכון הוצאה
export async function updateExpenseController(req, res) {
  try {
    const updated = await updateExpenseService(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// מחיקת הוצאה
export async function deleteExpenseController(req, res) {
  try {
    await deleteExpenseService(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
