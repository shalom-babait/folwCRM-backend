
import { createTreatmentType, deleteTreatmentTypeById, updateTreatmentTypeById, getAllTreatmentTypes, getTreatmentTypesByTherapistId } from './treatmentType.repo.js';
import pool from '../../services/database.js';

// הוספה
export async function createTreatmentTypeService(typeData, organizationId = null) {
	try {
		return await createTreatmentType(typeData, organizationId);
	} catch (error) {
		throw error;
	}
}

// מחיקה לפי ID
export async function deleteTreatmentTypeService(id, organizationId = null) {
	try {
		let sql = 'SELECT * FROM treatment_types WHERE treatment_type_id = ?';
		const params = [id];
		
		if (organizationId) {
			sql += ' AND organization_id = ?';
			params.push(organizationId);
		}
		
		const [existing] = await pool.execute(sql, params);
		if (existing.length === 0) {
			return false;
		}
		return await deleteTreatmentTypeById(id, organizationId);
	} catch (error) {
		throw error;
	}
}

// עדכון לפי ID
export async function updateTreatmentTypeService(id, updateData, organizationId = null) {
	try {
		let sql = 'SELECT * FROM treatment_types WHERE treatment_type_id = ?';
		const params = [id];
		
		if (organizationId) {
			sql += ' AND organization_id = ?';
			params.push(organizationId);
		}
		
		const [existing] = await pool.execute(sql, params);
		if (existing.length === 0) {
			return false;
		}
		return await updateTreatmentTypeById(id, updateData, organizationId);
	} catch (error) {
		throw error;
	}
}

// קבלת כל הרשימה
export async function getAllTreatmentTypesService(therapist_id = null, organizationId = null) {
	try {
		if (therapist_id) {
			return await getTreatmentTypesByTherapistId(therapist_id, organizationId);
		}
		return await getAllTreatmentTypes(organizationId);
	} catch (error) {
		throw error;
	}
}
