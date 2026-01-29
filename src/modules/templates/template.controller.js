import { createTemplateService, updateTemplateService, getTemplateByIdService } from './template.service.js';

export async function createTemplateController(req, res) {
	try {
		const template = await createTemplateService(req.body);
		res.status(201).json({ success: true, data: template });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}

export async function updateTemplateController(req, res) {
	try {
		const { id } = req.params;
		if (!id || isNaN(id)) {
			return res.status(400).json({ success: false, message: 'Invalid ID' });
		}
		const result = await updateTemplateService(Number(id), req.body);
		res.json({ success: true, data: result });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}

export async function getTemplateByIdController(req, res) {
	try {
		const { id } = req.params;
		if (!id || isNaN(id)) {
			return res.status(400).json({ success: false, message: 'Invalid ID' });
		}
		const template = await getTemplateByIdService(Number(id));
		if (!template) {
			return res.status(404).json({ success: false, message: 'Template not found' });
		}
		res.json({ success: true, data: template });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}
