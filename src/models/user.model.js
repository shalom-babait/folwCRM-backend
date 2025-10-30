import Joi from 'joi';

export const userSchema = Joi.object({
  first_name: Joi.string().min(2).max(15).required(),
  last_name: Joi.string().min(2).max(20).required(),
  teudat_zehut: Joi.string().length(9).optional().allow(null, ''),
  phone: Joi.string().pattern(/^05\d{8}$/).required(),
  city: Joi.string().max(15).required(),
  address: Joi.string().max(30).optional().allow(null, ''),
  email: Joi.string().email().max(30).required(),
  password: Joi.string().min(6).max(15).required(),
  role: Joi.string().valid('secretary','manager','therapist','patient','other').default('patient'),
  agree: Joi.number().valid(0, 1).default(0),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  birth_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null, '').optional()
});
