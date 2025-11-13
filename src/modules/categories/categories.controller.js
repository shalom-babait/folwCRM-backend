// src/modules/categories/categories.controller.js
import categoriesService from './categories.service.js';

class CategoriesController {
  // ========== Categories CRUD ==========
  
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoriesService.getAllCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesByType(req, res, next) {
    try {
      const { type } = req.params;
      const categories = await categoriesService.getCategoriesByType(type);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoriesService.getCategoryById(id);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const categoryId = await categoriesService.createCategory(req.body);
      const category = await categoriesService.getCategoryById(categoryId);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      await categoriesService.updateCategory(id, req.body);
      const category = await categoriesService.getCategoryById(id);
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await categoriesService.deleteCategory(id);
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== Prospect Categories ==========
  
  async assignToProspect(req, res, next) {
    try {
      const { prospect_id, category_id } = req.body;
      const userId = req.user?.user_id; // מה-JWT
      
      await categoriesService.assignCategoryToProspect(prospect_id, category_id, userId);
      
      res.status(201).json({
        success: true,
        message: 'Category assigned to prospect successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromProspect(req, res, next) {
    try {
      const { prospectId, categoryId } = req.params;
      await categoriesService.removeCategoryFromProspect(prospectId, categoryId);
      res.json({
        success: true,
        message: 'Category removed from prospect successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProspectCategories(req, res, next) {
    try {
      const { prospectId } = req.params;
      const categories = await categoriesService.getProspectCategories(prospectId);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getProspectsByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const prospects = await categoriesService.getProspectsByCategory(categoryId);
      res.json({
        success: true,
        data: prospects
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== Patient Categories ==========
  
  async assignToPatient(req, res, next) {
    try {
      const { patient_id, category_id } = req.body;
      const userId = req.user?.user_id;
      
      await categoriesService.assignCategoryToPatient(patient_id, category_id, userId);
      
      res.status(201).json({
        success: true,
        message: 'Category assigned to patient successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromPatient(req, res, next) {
    try {
      const { patientId, categoryId } = req.params;
      await categoriesService.removeCategoryFromPatient(patientId, categoryId);
      res.json({
        success: true,
        message: 'Category removed from patient successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientCategories(req, res, next) {
    try {
      const { patientId } = req.params;
      const categories = await categoriesService.getPatientCategories(patientId);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== User Categories ==========
  
  async assignToUser(req, res, next) {
    try {
      const { user_id, category_id } = req.body;
      await categoriesService.assignCategoryToUser(user_id, category_id);
      
      res.status(201).json({
        success: true,
        message: 'Category assigned to user successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromUser(req, res, next) {
    try {
      const { userId, categoryId } = req.params;
      await categoriesService.removeCategoryFromUser(userId, categoryId);
      res.json({
        success: true,
        message: 'Category removed from user successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCategories(req, res, next) {
    try {
      const { userId } = req.params;
      const categories = await categoriesService.getUserCategories(userId);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesController();