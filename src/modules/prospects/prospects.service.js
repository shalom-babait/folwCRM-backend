
import { 
  getAllProspects, 
  createProspect, 
  updateProspect, 
  updateProspectWithCategories 
} from "./prospects.repo.js";

import categoriesRepo from "../categories/categories.repo.js";


/**
 * שליפת כל המתעניינים
 */
export async function getAllProspectsService() {
  return await getAllProspects();
}


/**
 * יצירת prospect חדש
 * תומך גם ב-categories (מערך אובייקטים) וגם ב-category_ids (מערך מזהים)
 */
export async function createProspectService(prospectData) {
  let { categories, category_ids, ...prospectFields } = prospectData;
  if (Array.isArray(categories) && categories.length > 0) {
    category_ids = categories.map(c => typeof c === 'object' ? c.category_id : c).filter(Boolean);
  }
  const newProspect = await createProspect({ ...prospectFields, category_ids });
  return newProspect;
}

/**
 * עדכון prospect קיים
 */
export async function updateProspectService(prospectId, updateData) {
  return await updateProspect(prospectId, updateData);
}

/**
 * עדכון prospect כולל קטגוריות
 */
export async function updateProspectWithCategoriesService(prospectId, updateData) {
  return await updateProspectWithCategories(prospectId, updateData);
}
