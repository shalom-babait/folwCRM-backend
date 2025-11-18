// src/modules/categories/categories.controller.js
import categoriesService from './categories.service.js';

class CategoriesController {

  // Wrapper ל-error handling
  async handleRequest(res, next, fn) {
    try {
      await fn();
    } catch (err) {
      next(err);
    }
  }

  // ================= Categories CRUD =================
  getAllCategories = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const categories = await categoriesService.getAllCategories();
      res.json({ success: true, data: categories });
    });

  getCategoriesByType = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const { type } = req.params;
      const categories = await categoriesService.getCategoriesByType(type);
      res.json({ success: true, data: categories });
    });

  getCategoryById = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const id = req.params.id || req.params.categoryId;
      const category = await categoriesService.getCategoryById(id);
      res.json({ success: true, data: category });
    });

  createCategory = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      console.log('Creating category with data:', req.body);
      const categoryId = await categoriesService.createCategory(req.body);
      const category = await categoriesService.getCategoryById(categoryId);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    });

  updateCategory = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const id = req.params.id || req.params.categoryId;
      await categoriesService.updateCategory(id, req.body);
      const category = await categoriesService.getCategoryById(id);
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    });

  deleteCategory = (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const id = req.params.id || req.params.categoryId;
      await categoriesService.deleteCategory(id);
      res.json({ success: true, message: 'Category deleted successfully' });
    });

  // ================= Generic Assign / Remove / Get =================
  assignCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const { entityId, categoryId } = req.body;
      const userId = req.user?.user_id;
      await categoriesService.assignCategory(entityType, entityId, categoryId, userId);
      res.status(201).json({
        success: true,
        message: `Category assigned to ${entityType} successfully`
      });
    });

  removeCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      // Accept either params or body depending on route
      const entityId = req.params.entityId || req.body.entityId || req.params.prospectId || req.params.patientId || req.params.userId;
      const categoryId = req.params.categoryId || req.body.categoryId;
      await categoriesService.removeCategory(entityType, entityId, categoryId);
      res.json({
        success: true,
        message: `Category removed from ${entityType} successfully`
      });
    });

  getCategoriesByEntity = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const entityId = req.params.entityId || req.params.prospectId || req.params.patientId || req.params.userId;
      const categories = await categoriesService.getCategories(entityType, entityId);
      res.json({ success: true, data: categories });
    });

  getEntitiesByCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const { categoryId } = req.params;
      const entities = await categoriesService.getEntitiesByCategory(entityType, categoryId);
      res.json({ success: true, data: entities });
    });

  // Specific handlers expected by the routes (thin wrappers around the generic helpers)
  assignToProspect = this.assignCategory('prospect');
  removeFromProspect = this.removeCategory('prospect');
  getProspectCategories = this.getCategoriesByEntity('prospect');
  getProspectsByCategory = this.getEntitiesByCategory('prospect');

  assignToPatient = this.assignCategory('patient');
  removeFromPatient = this.removeCategory('patient');
  getPatientCategories = this.getCategoriesByEntity('patient');

  assignToUser = this.assignCategory('employee');
  removeFromUser = this.removeCategory('employee');
  getUserCategories = this.getCategoriesByEntity('employee');

}

export default new CategoriesController();
