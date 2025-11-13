// src/modules/categories/categories.routes.js
import express from 'express';
import categoriesController from './categories.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
  assignCategorySchema,
  categoryIdSchema,
  categoryTypeSchema
} from './categories.validation.js';

const router = express.Router();

// ========== Categories Management ========== 

// שליפת כל הקטגוריות
router.get(
  '/',
  authenticate,
  categoriesController.getAllCategories
);
// שליפת קטגוריות לפי סוג (type)
router.get(
  '/type/:type',
  authenticate,
  validate(categoryTypeSchema, 'params'),
  categoriesController.getCategoriesByType
);
// שליפת קטגוריה לפי מזהה
router.get(
  '/:id',
  authenticate,
  validate(categoryIdSchema, 'params'),
  categoriesController.getCategoryById
);
// יצירת קטגוריה חדשה
router.post(
  '/',
  authenticate,
  authorize(['manager', 'secretary']),
  validate(createCategorySchema),
  categoriesController.createCategory
);
// עדכון קטגוריה קיימת
router.put(
  '/:id',
  authenticate,
  authorize(['manager', 'secretary']),
  validate(categoryIdSchema, 'params'),
  validate(updateCategorySchema),
  categoriesController.updateCategory
);
// מחיקת קטגוריה לפי מזהה
router.delete(
  '/:id',
  authenticate,
  authorize(['manager']),
  validate(categoryIdSchema, 'params'),
  categoriesController.deleteCategory
);

// ========== Prospect Categories ========== 

// שיוך קטגוריה למתעניין (prospect)
router.post(
  '/assign/prospect',
  authenticate,
  validate(assignCategorySchema),
  categoriesController.assignToProspect
);
// הסרת שיוך קטגוריה ממתעניין
router.delete(
  '/assign/prospect/:prospectId/:categoryId',
  authenticate,
  categoriesController.removeFromProspect
);
// שליפת כל הקטגוריות של מתעניין
router.get(
  '/prospect/:prospectId',
  authenticate,
  categoriesController.getProspectCategories
);
// שליפת כל המתעניינים לפי קטגוריה
router.get(
  '/prospects-by-category/:categoryId',
  authenticate,
  categoriesController.getProspectsByCategory
);

// ========== Patient Categories ========== 

// שיוך קטגוריה למטופל
router.post(
  '/assign/patient',
  authenticate,
  validate(assignCategorySchema),
  categoriesController.assignToPatient
);
// הסרת שיוך קטגוריה ממטופל
router.delete(
  '/assign/patient/:patientId/:categoryId',
  authenticate,
  categoriesController.removeFromPatient
);
// שליפת כל הקטגוריות של מטופל
router.get(
  '/patient/:patientId',
  authenticate,
  categoriesController.getPatientCategories
);

// ========== User Categories ========== 

// שיוך קטגוריה למשתמש (עובד)
router.post(
  '/assign/user',
  authenticate,
  authorize(['manager']),
  validate(assignCategorySchema),
  categoriesController.assignToUser
);
// הסרת שיוך קטגוריה ממשתמש (עובד)
router.delete(
  '/assign/user/:userId/:categoryId',
  authenticate,
  authorize(['manager']),
  categoriesController.removeFromUser
);
// שליפת כל הקטגוריות של משתמש (עובד)
router.get(
  '/user/:userId',
  authenticate,
  categoriesController.getUserCategories
);

export default router;