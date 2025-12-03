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
  // normalize extraction of entity id from different routes/places
  getEntityIdFromReq(req) {
    return req.params.entityId || req.body.entityId || req.params.prospectId || req.params.patientId || req.params.userId;
  }

  assignCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const entityId = this.getEntityIdFromReq(req);
      const categoryId = req.body.categoryId || req.body.category_id;
      const userId = req.user?.user_id;

      if (!entityId) return res.status(400).json({ success: false, message: 'entityId is required' });
      if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId is required' });

      // delegate to service (service/repo should handle DB-level validation and FK checks)
      await categoriesService.assignCategory(entityType, entityId, categoryId, userId);
      res.status(201).json({ success: true, message: `Category assigned to ${entityType} successfully` });
    });

  removeCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const entityId = this.getEntityIdFromReq(req);
      const categoryId = req.params.categoryId || req.body.categoryId || req.body.category_id;

      if (!entityId) return res.status(400).json({ success: false, message: 'entityId is required' });
      if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId is required' });

      await categoriesService.removeCategory(entityType, entityId, categoryId);
      res.json({ success: true, message: `Category removed from ${entityType} successfully` });
    });

  getCategoriesByEntity = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const entityId = this.getEntityIdFromReq(req);
      if (!entityId) return res.status(400).json({ success: false, message: 'entityId is required' });

      const categories = await categoriesService.getCategories(entityType, entityId);
      res.json({ success: true, data: categories });
    });

  getEntitiesByCategory = (entityType) => (req, res, next) =>
    this.handleRequest(res, next, async () => {
      const categoryId = req.params.categoryId || req.params.id;
      if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId is required' });

      // Optional query param: includePerson=true to indicate caller wants personal fields included.
      // NOTE: the service/repo must support returning person data; if not, this flag will be ignored.
      const includePerson = req.query.includePerson === 'true';
      const entities = await categoriesService.getEntitiesByCategory(entityType, categoryId, { includePerson });
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
