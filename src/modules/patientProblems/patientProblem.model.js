// מחיקת דירוג מסוים מתוך בעיה מסוימת
export async function deleteProblemRatingByProblemId(patient_problem_id, patient_problem_rating_id) {
    const sql = `DELETE FROM patient_problem_ratings WHERE patient_problem_id = ? AND patient_problem_rating_id = ?`;
    await pool.query(sql, [patient_problem_id, patient_problem_rating_id]);
    return true;
}
// דירוגים לפי מזהה בעיה
export async function getProblemRatingsByProblemId(patient_problem_id) {
    const sql = `SELECT * FROM patient_problem_ratings WHERE patient_problem_id = ? ORDER BY rating_date DESC`;
    const [rows] = await pool.query(sql, [patient_problem_id]);
    return rows;
}
// כל הדירוגים לכל הבעיות
export async function getAllProblemRatings() {
    const sql = `SELECT * FROM patient_problem_ratings ORDER BY patient_problem_id, rating_date DESC`;
    const [rows] = await pool.query(sql);
    return rows;
}
// דירוגים לבעיה
export async function getRatingsByProblemId(patient_problem_id) {
    const sql = `SELECT * FROM patient_problem_ratings WHERE patient_problem_id = ? ORDER BY rating_date DESC`;
    const [rows] = await pool.query(sql, [patient_problem_id]);
    return rows;
}

export async function addProblemRating({ patient_problem_id, rating_date, score, notes = '', organization_id }) {
    const sql = `INSERT INTO patient_problem_ratings (patient_problem_id, rating_date, score, notes, organization_id) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [patient_problem_id, rating_date, score, notes, organization_id]);
    return { patient_problem_rating_id: result.insertId, patient_problem_id, rating_date, score, notes, organization_id };
}

export async function deleteProblemRating(patient_problem_rating_id) {
    const sql = `DELETE FROM patient_problem_ratings WHERE patient_problem_rating_id = ?`;
    await pool.query(sql, [patient_problem_rating_id]);
    return true;
}
import pool from '../../services/database.js';

export async function createPatientProblem({ patient_id, title, description = '', status = 'active' }, organizationId = null) {
    const sql = `INSERT INTO patient_problems (patient_id, title, description, status, organization_id) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [patient_id, title, description, status, organizationId || null]);
    return { patient_problem_id: result.insertId, patient_id, title, description, status };
}

export async function getPatientProblemsByPatient(patient_id, organizationId = null) {
    let sql = `SELECT * FROM patient_problems WHERE patient_id = ?`;
    const params = [patient_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(sql, params);
    return rows;
}

export async function getPatientProblemById(patient_problem_id) {
    const sql = `SELECT * FROM patient_problems WHERE patient_problem_id = ?`;
    const [rows] = await pool.query(sql, [patient_problem_id]);
    return rows[0] || null;
}

export async function updatePatientProblem(patient_problem_id, updateData, organizationId = null) {
    const fields = [];
    const values = [];
    for (const key in updateData) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
    }
    if (fields.length === 0) return false;
    
    let sql = `UPDATE patient_problems SET ${fields.join(', ')} WHERE patient_problem_id = ?`;
    values.push(patient_problem_id);
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      values.push(organizationId);
    }
    
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
}

export async function deletePatientProblem(patient_problem_id, organizationId = null) {
    let sql = `DELETE FROM patient_problems WHERE patient_problem_id = ?`;
    const params = [patient_problem_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    await pool.query(sql, params);
    return true;
}
