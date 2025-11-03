// מודל ולידציה לקבוצה
import Joi from 'joi';

export const groupSchema = Joi.object({
  group_name: Joi.string().min(2).max(50).required(),
  department_id: Joi.number().required()
});
