import { createExpenseService, getAllExpensesService, getExpenseByIdService, updateExpenseService, deleteExpenseService } from './expenses.service.js';
import logger from '../../config/logger.js';

// יצירת הוצאה
export async function createExpenseController(req, res) {
  try {
    const organizationId = req.organization_id;
    const expenseData = {
      ...req.body,
      organization_id: organizationId
    };
    
    // אם נבחר "אחר" כקטגוריה, נכניס את השם לעמודה החדשה
    if (expenseData.expense_category_id === 'other' && expenseData.other_category_name) {
      expenseData.expense_category_id = null;
    } else {
      expenseData.other_category_name = null;
    }
    
    const expense = await createExpenseService(expenseData);
    
    res.status(201).json(expense);
  } catch (err) {
    logger.error('שגיאה ביצירת הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}

// שליפת כל ההוצאות
export async function getAllExpensesController(req, res) {
  try {
    const organizationId = req.organization_id;
    const expenses = await getAllExpensesService(organizationId);
    res.json(expenses);
  } catch (err) {
    logger.error('שגיאה בשליפת כל ההוצאות:', err);
    res.status(500).json({ error: err.message });
  }
}

// שליפת הוצאה לפי מזהה
export async function getExpenseByIdController(req, res) {
  try {
    const organizationId = req.organization_id;
    const expense = await getExpenseByIdService(req.params.id, organizationId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    logger.error('שגיאה בשליפת הוצאה לפי מזהה:', err);
    res.status(500).json({ error: err.message });
  }
}

// עדכון הוצאה
export async function updateExpenseController(req, res) {
  try {
    const organizationId = req.organization_id;
    const updated = await updateExpenseService(req.params.id, req.body, organizationId);
    res.json(updated);
  } catch (err) {
    logger.error('שגיאה בעדכון הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}

// מחיקת הוצאה
export async function deleteExpenseController(req, res) {
  try {
    const organizationId = req.organization_id;
    await deleteExpenseService(req.params.id, organizationId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    logger.error('שגיאה במחיקת הוצאה:', err);
    res.status(500).json({ error: err.message });
  }
}
