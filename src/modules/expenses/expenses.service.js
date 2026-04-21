import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } from './expenses.repo.js';

export async function createExpenseService(expenseData) {
  return await createExpense(expenseData);
}

export async function getAllExpensesService(organizationId = null) {
  return await getAllExpenses(organizationId);
}

export async function getExpenseByIdService(expense_id, organizationId = null) {
  return await getExpenseById(expense_id, organizationId);
}

export async function updateExpenseService(expense_id, updateData, organizationId = null) {
  return await updateExpense(expense_id, updateData, organizationId);
}

export async function deleteExpenseService(expense_id, organizationId = null) {
  return await deleteExpense(expense_id, organizationId);
}
