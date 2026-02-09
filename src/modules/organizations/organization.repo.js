// שליפת כל הארגונים
export async function getAllOrganizations() {
	const sql = 'SELECT * FROM organizations ORDER BY organization_name';
	const [rows] = await pool.query(sql);
	return rows;
}
import pool from '../../services/database.js';

// הוספת ארגון
export async function createOrganization(orgData) {
	const sql = `INSERT INTO organizations
		(organization_name, owner_user_id, organization_type, contact_name, contact_phone, contact_email, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
	const {
		organization_name,
		owner_user_id,
		organization_type,
		contact_name,
		contact_phone,
		contact_email,
		status
	} = orgData;
	const [result] = await pool.query(sql, [organization_name, owner_user_id, organization_type, contact_name, contact_phone, contact_email, status]);
	return { organization_id: result.insertId, ...orgData };
}
