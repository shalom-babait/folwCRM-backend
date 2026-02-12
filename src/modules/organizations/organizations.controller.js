import { getAllOrganizationsService } from './organizations.service.js';
import { createOrganizationService } from './organizations.service.js';
import { validateOrganization } from './organizations.validation.js';

// שליפת כל הארגונים
export async function getAllOrganizationsController(req, res) {
	try {
		const orgs = await getAllOrganizationsService();
		res.json({ success: true, data: orgs });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
}

// יצירת ארגון
export async function createOrganizationController(req, res) {
	try {
		const payload = req.body; // { organization, person, user }
		// Validate organization only (person/user validation can be added if needed)
		const { error } = validateOrganization(payload.organization);
		if (error) {
			return res.status(400).json({ success: false, message: error.details[0].message });
		}
		const result = await createOrganizationService(payload);
		res.status(201).json({ success: true, data: result });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
}
