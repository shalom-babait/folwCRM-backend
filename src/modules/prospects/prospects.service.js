
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
export async function getAllProspectsService(organizationId = null) {
  return await getAllProspects(organizationId);
}


/**
 * יצירת prospect חדש
 * תומך גם ב-categories (מערך אובייקטים) וגם ב-category_ids (מערך מזהים)
 */
export async function createProspectService(prospectData, organizationId = null) {
  let { categories, category_ids, ...prospectFields } = prospectData;
  if (Array.isArray(categories) && categories.length > 0) {
    category_ids = categories.map(c => typeof c === 'object' ? c.category_id : c).filter(Boolean);
  }
  const newProspect = await createProspect({ ...prospectFields, category_ids }, organizationId);
  return newProspect;
}

/**
 * עדכון prospect קיים
 */
export async function updateProspectService(prospectId, updateData, organizationId = null) {
  return await updateProspect(prospectId, updateData, organizationId);
}

/**
 * עדכון prospect כולל קטגוריות
 */
export async function updateProspectWithCategoriesService(prospectId, updateData, organizationId = null) {
  return await updateProspectWithCategories(prospectId, updateData, organizationId);
}
