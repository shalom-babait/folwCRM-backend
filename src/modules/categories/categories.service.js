// src/modules/categories/categories.service.js
import categoriesRepo from './categories.repo.js';

class CategoriesService {
  // ========== Categories Management ==========

  async getAllCategories(organizationId = null) {
    return await categoriesRepo.findAll(organizationId);
  }

  async getCategoriesByType(type, organizationId = null) {
    const validTypes = ['prospect', 'patient', 'employee', 'treatment'];
    if (!validTypes.includes(type)) throw new Error('Invalid category type');
    return await categoriesRepo.findByType(type, organizationId);
  }

  async getCategoryById(id, organizationId = null) {
    const category = await categoriesRepo.findById(id, organizationId);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(categoryData, organizationId = null) {
    const existingCategories = await categoriesRepo.findByType(categoryData.category_type, organizationId);
    if (existingCategories.find(c => c.category_name === categoryData.category_name)) {
      throw new Error('Category with this name already exists for this type');
    }
    return await categoriesRepo.create(categoryData, organizationId);
  }

  async updateCategory(id, categoryData, organizationId = null) {
    await this.getCategoryById(id, organizationId);
    return await categoriesRepo.update(id, categoryData, organizationId);
  }

  async deleteCategory(id, organizationId = null) {
    await this.getCategoryById(id, organizationId);
    return await categoriesRepo.softDelete(id, organizationId);
  }

  async hardDeleteCategory(id, organizationId = null) {
    await this.getCategoryById(id, organizationId);
    return await categoriesRepo.delete(id, organizationId);
  }

  // ========== Generic Category Assignment ==========

  #typeMap = { prospect: 'prospect', patient: 'patient', employee: 'employee' };
  #assignMap = { prospect: 'assignToProspect', patient: 'assignToPatient', employee: 'assignToUser' };
  #removeMap = { prospect: 'removeFromProspect', patient: 'removeFromPatient', employee: 'removeFromUser' };
  #getMap = { prospect: 'findProspectCategories', patient: 'findPatientCategories', employee: 'findUserCategories' };
  #getByCategoryMap = { prospect: 'findProspectsByCategory', employee: 'findUsersByCategory', patient: 'findPatientsByCategory' };

  async assignCategory(entityType, entityId, categoryId, assignedBy = null, organizationId = null) {
    const category = await this.getCategoryById(categoryId, organizationId);
    if (category.category_type !== this.#typeMap[entityType]) {
      throw new Error(`This category is not for ${entityType}s`);
    }

    try {
      return await categoriesRepo[this.#assignMap[entityType]](entityId, categoryId, assignedBy, organizationId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error(`Category already assigned to this ${entityType}`);
      }
      throw error;
    }
  }

  async removeCategory(entityType, entityId, categoryId, organizationId = null) {
    return await categoriesRepo[this.#removeMap[entityType]](entityId, categoryId, organizationId);
  }

  async getCategories(entityType, entityId, organizationId = null) {
    return await categoriesRepo[this.#getMap[entityType]](entityId, organizationId);
  }

  // options: { includePerson: boolean }
  async getEntitiesByCategory(entityType, categoryId, options = {}, organizationId = null) {
    if (!this.#getByCategoryMap[entityType]) {
      throw new Error(`getByCategory not supported for ${entityType}`);
    }
    const category = await this.getCategoryById(categoryId, organizationId);
    if (category.category_type !== this.#typeMap[entityType]) {
      throw new Error(`This category is not for ${entityType}s`);
    }
    const fnName = this.#getByCategoryMap[entityType];
    const fn = categoriesRepo[fnName];
    if (!fn) throw new Error(`repo missing method ${fnName}`);
    // allow repo implementations to accept (categoryId, options, organizationId)
    return await fn.call(categoriesRepo, categoryId, options, organizationId);
  }
}

export default new CategoriesService();
