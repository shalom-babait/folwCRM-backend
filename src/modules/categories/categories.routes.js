import express from 'express';
import categoriesController from './categories.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.js';

import {
  createCategorySchema,
  updateCategorySchema,
  assignCategorySchema,
  categoryIdSchema,
  categoryTypeSchema
} from './categories.validation.js';

const router = express.Router();

// שליפת כל הקטגוריות
router.get(
  '/list',
  // authenticate,
  categoriesController.getAllCategories
);

// שליפת קטגוריות לפי סוג
router.get(
  '/list/type/:type',
  // authenticate,
  // validate(categoryTypeSchema, 'params'),
  categoriesController.getCategoriesByType
);

// שליפת קטגוריה לפי מזהה
router.get(
  '/get/:id',
  authenticate,
  validate(categoryIdSchema, 'params'),
  categoriesController.getCategoryById
);

// יצירת קטגוריה
router.post(
  '/create',
  // authenticate,
  // authorize(['manager', 'secretary']),
  // validate(createCategorySchema),
  categoriesController.createCategory
);

// עדכון קטגוריה
router.put(
  '/update/:id',
  authenticate,
  authorize(['manager', 'secretary']),
  validate(categoryIdSchema, 'params'),
  validate(updateCategorySchema),
  categoriesController.updateCategory
);

// מחיקת קטגוריה
router.delete(
  '/delete/:id',
  authenticate,
  authorize(['manager']),
  validate(categoryIdSchema, 'params'),
  categoriesController.deleteCategory
);

router.post(
  '/assign/prospect',
  authenticate,
  validate(assignCategorySchema),
  categoriesController.assignToProspect
);

router.delete(
  '/remove/prospect/:prospectId/:categoryId',
  authenticate,
  categoriesController.removeFromProspect
);

router.get(
  '/prospect/:prospectId/categories',
  authenticate,
  categoriesController.getProspectCategories
);

router.get(
  '/prospects-by-category/:categoryId',
  authenticate,
  categoriesController.getProspectsByCategory
);

router.post(
  '/assign/patient',
  authenticate,
  validate(assignCategorySchema),
  categoriesController.assignToPatient
);

router.delete(
  '/remove/patient/:patientId/:categoryId',
  authenticate,
  categoriesController.removeFromPatient
);

router.get(
  '/patient/:patientId/categories',
  authenticate,
  categoriesController.getPatientCategories
);

router.post(
  '/assign/user',
  authenticate,
  authorize(['manager']),
  validate(assignCategorySchema),
  categoriesController.assignToUser
);

router.delete(
  '/remove/user/:userId/:categoryId',
  authenticate,
  authorize(['manager']),
  categoriesController.removeFromUser
);

router.get(
  '/user/:userId/categories',
  authenticate,
  categoriesController.getUserCategories
);


export default router;
