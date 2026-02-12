import { createExpenseCategory, getAllExpenseCategories, getExpenseCategoryById, updateExpenseCategory, deleteExpenseCategory } from './expense_categories.repo.js';

export async function createExpenseCategoryService(categoryData) {
  return await createExpenseCategory(categoryData);
}

export async function getAllExpenseCategoriesService() {
  return await getAllExpenseCategories();
}

export async function getExpenseCategoryByIdService(expense_category_id) {
  return await getExpenseCategoryById(expense_category_id);
}

export async function updateExpenseCategoryService(expense_category_id, updateData) {
  return await updateExpenseCategory(expense_category_id, updateData);
}

export async function deleteExpenseCategoryService(expense_category_id) {
  return await deleteExpenseCategory(expense_category_id);
}
