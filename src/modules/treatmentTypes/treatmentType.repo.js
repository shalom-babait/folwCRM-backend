
import pool, { deleteFromTable, updateTable } from '../../services/database.js';

// הוספה
export async function createTreatmentType(typeData) {
	const { type_name, type_description, therapist_id, color, price, price_default } = typeData;
	// תמיד לעבוד עם price_default בלבד
	const finalPrice = price_default !== undefined ? price_default : (price !== undefined ? price : null);
	const query = `
		INSERT INTO treatment_types (type_name, type_description, therapist_id, color, price_default)
		VALUES (?, ?, ?, ?, ?)
	`;
	try {
		console.log('[repo] יצירת סוג טיפול - קלט:', typeData);
		console.log('[repo] שאילתה:', query);
		console.log('[repo] ערכים:', [type_name, type_description, therapist_id, color, finalPrice]);
		const [result] = await pool.execute(query, [type_name, type_description, therapist_id, color, finalPrice]);
		console.log('[repo] סוג טיפול נוצר בהצלחה:', result);
		return {
			treatment_type_id: result.insertId,
			type_name,
			type_description,
			therapist_id,
			color,
			price_default: finalPrice,
			message: 'treatment type created successfully'
		};
	} catch (error) {
		console.error('[repo] שגיאה ביצירת סוג טיפול:', error);
		throw error;
	}
}

// מחיקה לפי ID
export async function deleteTreatmentTypeById(typeId) {
	return deleteFromTable('treatment_types', { treatment_type_id: typeId });
}

// עדכון לפי ID
export async function updateTreatmentTypeById(typeId, updateData) {
	// נוודא שצבע ומחיר ייכללו אם נשלחו (price_default בלבד)
	const allowedFields = ['type_name', 'type_description', 'therapist_id', 'color', 'price_default'];
	const filteredData = {};
	for (const key of allowedFields) {
		if (key in updateData) filteredData[key] = updateData[key];
	}
	return updateTable('treatment_types', filteredData, { treatment_type_id: typeId });
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
