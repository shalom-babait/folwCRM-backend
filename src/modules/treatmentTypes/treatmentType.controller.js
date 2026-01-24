import {
	createTreatmentTypeService,
	deleteTreatmentTypeService,
	updateTreatmentTypeService,
	getAllTreatmentTypesService
} from './treatmentType.service.js';

// הוספה
export async function createTreatmentTypeController(req, res) {
	try {
		const newType = await createTreatmentTypeService(req.body);
		res.status(201).json({ success: true, data: newType });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}

// מחיקה לפי ID
export async function deleteTreatmentTypeController(req, res) {
	try {
		const { id } = req.params;
		if (!id || isNaN(id)) {
			return res.status(400).json({ success: false, message: 'Invalid ID' });
		}
		const result = await deleteTreatmentTypeService(id);
		if (result) {
			res.json({ success: true, message: 'Treatment type deleted successfully' });
		} else {
			res.status(404).json({ success: false, message: 'Treatment type not found' });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}

// עדכון לפי ID
export async function updateTreatmentTypeController(req, res) {
	try {
		const { id } = req.params;
		const updateData = req.body;
		if (!id || isNaN(id)) {
			return res.status(400).json({ success: false, message: 'Invalid ID' });
		}
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ success: false, message: 'No update data provided' });
		}
		const result = await updateTreatmentTypeService(id, updateData);
		if (result) {
			res.json({ success: true, message: 'Treatment type updated successfully' });
		} else {
			res.status(404).json({ success: false, message: 'Treatment type not found or no changes made' });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
}

// קבלת כל הרשימה
export async function getAllTreatmentTypesController(req, res) {
	try {
		const treatmentTypes = await getAllTreatmentTypesService(); // נוודא שהנתונים הם מערך
		if (!Array.isArray(treatmentTypes)) {
			return res.status(500).json({ error: 'Data is not an array' });
		}
		res.status(200).json(treatmentTypes);
	} catch (error) {
		console.error('Error fetching treatment types:', error);
		res.status(500).json({ error: 'Failed to fetch treatment types' });
	}
}
