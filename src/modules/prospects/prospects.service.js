import { getAllProspects } from "./prospects.repo.js";
import { createProspect } from "./prospects.repo.js";

/**
 * שליפת כל המתעניינים
 */
export async function getAllProspectsService() {
	return await getAllProspects();
}

/**
 * יוצר prospect חדש
 */
export async function createProspectService(prospectData) {
	// אפשר להוסיף ולידציה בסיסית כאן במידת הצורך
	return await createProspect(prospectData);
}
