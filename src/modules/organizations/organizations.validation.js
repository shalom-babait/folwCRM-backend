import Joi from 'joi';

export function validateOrganization(data) {
	const schema = Joi.object({
		organization_name: Joi.string().max(150).required(),
		owner_user_id: Joi.number().integer().required(),
		organization_type: Joi.string().valid('company', 'clinic', 'personal').required(),
		contact_name: Joi.string().max(100).required(),
		contact_phone: Joi.string().max(20).required(),
		contact_email: Joi.string().email().max(100).required(),
		status: Joi.string().valid('active', 'inactive').required()
	});
	return schema.validate(data);
}
