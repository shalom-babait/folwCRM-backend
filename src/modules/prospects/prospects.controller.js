import { updateProspectWithCategoriesService } from "./prospects.service.js";
/**
 * עדכון prospect כולל קטגוריות (PUT /api/prospects/updateWithCategories/:prospectId)
 */
export async function updateProspectWithCategoriesController(req, res) {
	try {
		const { prospectId } = req.params;
		const updateData = req.body;
		const result = await updateProspectWithCategoriesService(prospectId, updateData);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message || 'Failed to update prospect with categories' });
	}
}
import { updateProspectService } from "./prospects.service.js";
/**
 * עדכון prospect קיים (PUT /api/prospects/update/:prospectId)
 */
export async function updateProspectController(req, res) {
	try {
		const { prospectId } = req.params;
		const updateData = req.body;
		const result = await updateProspectService(prospectId, updateData);
		if (result.affectedRows > 0) {
			res.json({ success: true });
		} else {
			res.status(404).json({ error: 'Prospect not found or no fields updated' });
		}
	} catch (error) {
		res.status(500).json({ error: error.message || 'Failed to update prospect' });
	}
}
import { getAllProspectsService } from "./prospects.service.js";

/**
 * שליפת כל המתעניינים (GET /api/prospects)
 */
export async function getAllProspectsController(req, res) {
	try {
		const prospects = await getAllProspectsService();
		res.json(prospects);
	} catch (error) {
		res.status(500).json({ error: error.message || "Failed to get prospects" });
	}
}
import { createProspectService } from "./prospects.service.js";

/**
 * יצירת prospect חדש (POST /api/prospects)
 */
export async function createProspectController(req, res) {
	try {
		const prospectData = req.body;
		const newProspect = await createProspectService(prospectData);
		res.status(201).json(newProspect);
	} catch (error) {
		res.status(500).json({ error: error.message || "Failed to create prospect" });
	}
}
