import Joi from 'joi';

export const departmentSchema = Joi.object({
  department_name: Joi.string().min(2).max(20).required()
});
