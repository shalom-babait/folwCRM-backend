import { createTemplate, updateTemplate, getTemplateById } from './template.repo.js';

export async function createTemplateService(templateData) {
	return await createTemplate(templateData);
}

export async function updateTemplateService(templateId, updateData) {
	return await updateTemplate(templateId, updateData);
}

export async function getTemplateByIdService(templateId) {
	return await getTemplateById(templateId);
}
