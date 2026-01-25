
import pool, { deleteFromTable, updateTable } from '../../services/database.js';

// הוספה
export async function createTreatmentType(typeData) {
	const { type_name, type_description, therapist_id } = typeData;
	const query = `
		INSERT INTO treatment_types (type_name, type_description, therapist_id)
		VALUES (?, ?, ?)
	`;
	try {
		const [result] = await pool.execute(query, [type_name, type_description, therapist_id]);
		return {
			treatment_type_id: result.insertId,
			type_name,
			type_description,
			therapist_id,
			message: 'treatment type created successfully'
		};
	} catch (error) {
		throw error;
	}
}

// מחיקה לפי ID
export async function deleteTreatmentTypeById(typeId) {
	return deleteFromTable('treatment_types', { treatment_type_id: typeId });
}

// עדכון לפי ID
export async function updateTreatmentTypeById(typeId, updateData) {
	return updateTable('treatment_types', updateData, { treatment_type_id: typeId });
}

// קבלת כל הרשימה
export async function getAllTreatmentTypes() {
	const query = 'SELECT * FROM treatment_types';
	const [rows] = await pool.execute(query);
	return rows;
}

// קבלת רשימה לפי therapist_id
export async function getTreatmentTypesByTherapistId(therapist_id) {
	const query = 'SELECT * FROM treatment_types WHERE therapist_id = ?';
	const [rows] = await pool.execute(query, [therapist_id]);
	return rows;
}
