// src/modules/categories/categories.service.js
import categoriesRepo from './categories.repo.js';

class CategoriesService {
  // ========== Categories Management ==========
  
  async getAllCategories() {
    return await categoriesRepo.findAll();
  }

  async getCategoriesByType(type) {
    const validTypes = ['prospect', 'patient', 'employee', 'treatment'];
    if (!validTypes.includes(type)) {
      throw new Error('Invalid category type');
    }
    return await categoriesRepo.findByType(type);
  }

  async getCategoryById(id) {
    const category = await categoriesRepo.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(categoryData) {
    // בדיקה שלא קיימת קטגוריה עם אותו שם ואותו סוג
    const existingCategories = await categoriesRepo.findByType(categoryData.category_type);
    const duplicate = existingCategories.find(c => c.category_name === categoryData.category_name);
    
    if (duplicate) {
      throw new Error('Category with this name already exists for this type');
    }

    return await categoriesRepo.create(categoryData);
  }

  async updateCategory(id, categoryData) {
    await this.getCategoryById(id); // בדיקה שקיים
    return await categoriesRepo.update(id, categoryData);
  }

  async deleteCategory(id) {
    await this.getCategoryById(id); // בדיקה שקיים
    return await categoriesRepo.softDelete(id); // מחיקה רכה
  }

  async hardDeleteCategory(id) {
    await this.getCategoryById(id);
    return await categoriesRepo.delete(id); // מחיקה קשה
  }

  // ========== Prospect Categories ==========
  
  async assignCategoryToProspect(prospectId, categoryId, assignedBy) {
    // בדיקה שהקטגוריה מתאימה
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== 'prospect') {
      throw new Error('This category is not for prospects');
    }

    try {
      return await categoriesRepo.assignToProspect(prospectId, categoryId, assignedBy);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category already assigned to this prospect');
      }
      throw error;
    }
  }

  async removeCategoryFromProspect(prospectId, categoryId) {
    return await categoriesRepo.removeFromProspect(prospectId, categoryId);
  }

  async getProspectCategories(prospectId) {
    return await categoriesRepo.findProspectCategories(prospectId);
  }

  async getProspectsByCategory(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== 'prospect') {
      throw new Error('This category is not for prospects');
    }
    return await categoriesRepo.findProspectsByCategory(categoryId);
  }

  // ========== Patient Categories ==========
  
  async assignCategoryToPatient(patientId, categoryId, assignedBy) {
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== 'patient') {
      throw new Error('This category is not for patients');
    }

    try {
      return await categoriesRepo.assignToPatient(patientId, categoryId, assignedBy);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category already assigned to this patient');
      }
      throw error;
    }
  }

  async removeCategoryFromPatient(patientId, categoryId) {
    return await categoriesRepo.removeFromPatient(patientId, categoryId);
  }

  async getPatientCategories(patientId) {
    return await categoriesRepo.findPatientCategories(patientId);
  }

  // ========== User Categories ==========
  
  async assignCategoryToUser(userId, categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== 'employee') {
      throw new Error('This category is not for employees');
    }

    try {
      return await categoriesRepo.assignToUser(userId, categoryId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category already assigned to this user');
      }
      throw error;
    }
  }

  async removeCategoryFromUser(userId, categoryId) {
    return await categoriesRepo.removeFromUser(userId, categoryId);
  }

  async getUserCategories(userId) {
    return await categoriesRepo.findUserCategories(userId);
  }
}

export default new CategoriesService();