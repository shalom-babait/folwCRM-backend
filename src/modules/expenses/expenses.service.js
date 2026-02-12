import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } from './expenses.repo.js';

export async function createExpenseService(expenseData) {
  return await createExpense(expenseData);
}

export async function getAllExpensesService() {
  return await getAllExpenses();
}

export async function getExpenseByIdService(expense_id) {
  return await getExpenseById(expense_id);
}

export async function updateExpenseService(expense_id, updateData) {
  return await updateExpense(expense_id, updateData);
}

export async function deleteExpenseService(expense_id) {
  return await deleteExpense(expense_id);
}
