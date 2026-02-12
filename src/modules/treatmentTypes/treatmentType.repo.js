
import pool, { deleteFromTable, updateTable } from '../../services/database.js';

// הוספה
export async function createTreatmentType(typeData, organizationId = null) {
	const { type_name, type_description, therapist_id, color, price, price_default } = typeData;
	// תמיד לעבוד עם price_default בלבד
	const finalPrice = price_default !== undefined ? price_default : (price !== undefined ? price : null);
	const query = `
		INSERT INTO treatment_types (type_name, type_description, therapist_id, color, price_default, organization_id)
		VALUES (?, ?, ?, ?, ?, ?)
	`;
	   try {
		   const [result] = await pool.execute(query, [type_name, type_description, therapist_id, color, finalPrice, organizationId || null]);
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
export async function deleteTreatmentTypeById(typeId, organizationId = null) {
	let sql = 'DELETE FROM treatment_types WHERE treatment_type_id = ?';
	const params = [typeId];
	
	if (organizationId) {
		sql += ' AND organization_id = ?';
		params.push(organizationId);
	}
	
	const [result] = await pool.execute(sql, params);
	return result.affectedRows > 0;
}

// עדכון לפי ID
export async function updateTreatmentTypeById(typeId, updateData, organizationId = null) {
	// נוודא שצבע ומחיר ייכללו אם נשלחו (price_default בלבד)
	const allowedFields = ['type_name', 'type_description', 'therapist_id', 'color', 'price_default'];
	const filteredData = {};
	for (const key of allowedFields) {
		if (key in updateData) filteredData[key] = updateData[key];
	}
	
	const fields = [];
	const values = [];
	for (const key in filteredData) {
		fields.push(`${key} = ?`);
		values.push(filteredData[key]);
	}
	
	if (fields.length === 0) return false;
	
	let sql = `UPDATE treatment_types SET ${fields.join(', ')} WHERE treatment_type_id = ?`;
	values.push(typeId);
	
	if (organizationId) {
		sql += ' AND organization_id = ?';
		values.push(organizationId);
	}
	
	const [result] = await pool.execute(sql, values);
	return result.affectedRows > 0;
}

// קבלת כל הרשימה
export async function getAllTreatmentTypes(organizationId = null) {
	let query = 'SELECT * FROM treatment_types';
	const params = [];
	
	if (organizationId) {
		query += ' WHERE organization_id = ?';
		params.push(organizationId);
	}
	
	const [rows] = await pool.execute(query, params);
	return rows;
}

// קבלת רשימה לפי therapist_id
export async function getTreatmentTypesByTherapistId(therapist_id, organizationId = null) {
	let query = 'SELECT * FROM treatment_types WHERE therapist_id = ?';
	const params = [therapist_id];
	
	if (organizationId) {
		query += ' AND organization_id = ?';
		params.push(organizationId);
	}
	
	const [rows] = await pool.execute(query, params);
	return rows;
}
