
import { createTreatmentType, deleteTreatmentTypeById, updateTreatmentTypeById, getAllTreatmentTypes, getTreatmentTypesByTherapistId } from './treatmentType.repo.js';
import pool from '../../services/database.js';

// הוספה
export async function createTreatmentTypeService(typeData) {
	try {
		return await createTreatmentType(typeData);
	} catch (error) {
		throw error;
	}
}

// מחיקה לפי ID
export async function deleteTreatmentTypeService(id) {
	try {
		const [existing] = await pool.execute(
			'SELECT * FROM treatment_types WHERE treatment_type_id = ?',
			[id]
		);
		if (existing.length === 0) {
			return false;
		}
		return await deleteTreatmentTypeById(id);
	} catch (error) {
		throw error;
	}
}

// עדכון לפי ID
export async function updateTreatmentTypeService(id, updateData) {
	try {
		const [existing] = await pool.execute(
			'SELECT * FROM treatment_types WHERE treatment_type_id = ?',
			[id]
		);
		if (existing.length === 0) {
			return false;
		}
		return await updateTreatmentTypeById(id, updateData);
	} catch (error) {
		throw error;
	}
}

// קבלת כל הרשימה
export async function getAllTreatmentTypesService(therapist_id = null) {
	try {
		if (therapist_id) {
			return await getTreatmentTypesByTherapistId(therapist_id);
		}
		return await getAllTreatmentTypes();
	} catch (error) {
		throw error;
	}
}
