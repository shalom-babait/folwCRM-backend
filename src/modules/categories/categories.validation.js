// src/modules/categories/categories.validation.js
import Joi from 'joi';

export const createCategorySchema = Joi.object({
  category_type: Joi.string()
    .valid('prospect', 'patient', 'employee', 'treatment')
    .required()
    .messages({
      'any.only': 'סוג קטגוריה לא חוקי',
      'any.required': 'סוג קטגוריה הוא שדה חובה'
    }),
  
  category_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'שם הקטגוריה יכול להכיל רק אותיות אנגליות קטנות וקו תחתון',
      'any.required': 'שם הקטגוריה הוא שדה חובה'
    }),
  
  category_label: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'any.required': 'תווית הקטגוריה היא שדה חובה'
    }),
  
  description: Joi.string()
    .max(500)
    .allow('', null)
    .optional(),
  
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .default('#2196F3')
    .messages({
      'string.pattern.base': 'צבע לא חוקי (צריך להיות בפורמט #RRGGBB)'
    }),
  
  icon: Joi.string()
    .max(30)
    .allow('', null)
    .optional(),
  
  display_order: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

export const updateCategorySchema = Joi.object({
  category_label: Joi.string()
    .min(2)
    .max(50)
    .optional(),
  
  description: Joi.string()
    .max(500)
    .allow('', null)
    .optional(),
  
  color: Joi.string()
    .pattern(/^#[0-9A-F]{6}$/i)
    .optional(),
  
  icon: Joi.string()
    .max(30)
    .allow('', null)
    .optional(),
  
  display_order: Joi.number()
    .integer()
    .min(0)
    .optional(),
  
  is_active: Joi.boolean()
    .optional()
}).min(1); // לפחות שדה אחד חייב להיות

export const assignCategorySchema = Joi.object({
  prospect_id: Joi.number()
    .integer()
    .positive()
    .when('patient_id', {
      is: Joi.exist(),
      then: Joi.forbidden(),
      otherwise: Joi.when('user_id', {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.optional()
      })
    }),
  
  patient_id: Joi.number()
    .integer()
    .positive()
    .when('prospect_id', {
      is: Joi.exist(),
      then: Joi.forbidden(),
      otherwise: Joi.when('user_id', {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.optional()
      })
    }),
  
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  
  category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'מזהה קטגוריה הוא שדה חובה'
    })
}).xor('prospect_id', 'patient_id', 'user_id'); // בדיוק אחד מהם חייב להיות

export const categoryIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'מזהה קטגוריה הוא שדה חובה'
    })
});

export const categoryTypeSchema = Joi.object({
  type: Joi.string()
    .valid('prospect', 'patient', 'employee', 'treatment')
    .required()
    .messages({
      'any.only': 'סוג קטגוריה לא חוקי',
      'any.required': 'סוג קטגוריה הוא שדה חובה'
    })
});