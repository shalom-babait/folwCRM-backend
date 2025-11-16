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
