// src/modules/categories/categories.service.js
import categoriesRepo from './categories.repo.js';

class CategoriesService {
  // ========== Categories Management ==========

  async getAllCategories() {
    return await categoriesRepo.findAll();
  }

  async getCategoriesByType(type) {
    const validTypes = ['prospect', 'patient', 'employee', 'treatment'];
    if (!validTypes.includes(type)) throw new Error('Invalid category type');
    return await categoriesRepo.findByType(type);
  }

  async getCategoryById(id) {
    const category = await categoriesRepo.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(categoryData) {
    const existingCategories = await categoriesRepo.findByType(categoryData.category_type);
    if (existingCategories.find(c => c.category_name === categoryData.category_name)) {
      throw new Error('Category with this name already exists for this type');
    }
    return await categoriesRepo.create(categoryData);
  }

  async updateCategory(id, categoryData) {
    await this.getCategoryById(id);
    return await categoriesRepo.update(id, categoryData);
  }

  async deleteCategory(id) {
    await this.getCategoryById(id);
    return await categoriesRepo.softDelete(id);
  }

  async hardDeleteCategory(id) {
    await this.getCategoryById(id);
    return await categoriesRepo.delete(id);
  }

  // ========== Generic Category Assignment ==========

  #typeMap = { prospect: 'prospect', patient: 'patient', employee: 'employee' };
  #assignMap = { prospect: 'assignToProspect', patient: 'assignToPatient', employee: 'assignToUser' };
  #removeMap = { prospect: 'removeFromProspect', patient: 'removeFromPatient', employee: 'removeFromUser' };
  #getMap = { prospect: 'findProspectCategories', patient: 'findPatientCategories', employee: 'findUserCategories' };
  #getByCategoryMap = { prospect: 'findProspectsByCategory' }; // Only prospect has getByCategory

  async assignCategory(entityType, entityId, categoryId, assignedBy = null) {
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== this.#typeMap[entityType]) {
      throw new Error(`This category is not for ${entityType}s`);
    }

    try {
      return await categoriesRepo[this.#assignMap[entityType]](entityId, categoryId, assignedBy);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error(`Category already assigned to this ${entityType}`);
      }
      throw error;
    }
  }

  async removeCategory(entityType, entityId, categoryId) {
    return await categoriesRepo[this.#removeMap[entityType]](entityId, categoryId);
  }

  async getCategories(entityType, entityId) {
    return await categoriesRepo[this.#getMap[entityType]](entityId);
  }

  async getEntitiesByCategory(entityType, categoryId) {
    if (!this.#getByCategoryMap[entityType]) {
      throw new Error(`getByCategory not supported for ${entityType}`);
    }
    const category = await this.getCategoryById(categoryId);
    if (category.category_type !== this.#typeMap[entityType]) {
      throw new Error(`This category is not for ${entityType}s`);
    }
    return await categoriesRepo[this.#getByCategoryMap[entityType]](categoryId);
  }
}

export default new CategoriesService();
