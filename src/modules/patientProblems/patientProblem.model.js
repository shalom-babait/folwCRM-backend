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

export async function addProblemRating({ patient_problem_id, rating_date, score, notes = '' }) {
    const sql = `INSERT INTO patient_problem_ratings (patient_problem_id, rating_date, score, notes) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [patient_problem_id, rating_date, score, notes]);
    return { patient_problem_rating_id: result.insertId, patient_problem_id, rating_date, score, notes };
}

export async function deleteProblemRating(patient_problem_rating_id) {
    const sql = `DELETE FROM patient_problem_ratings WHERE patient_problem_rating_id = ?`;
    await pool.query(sql, [patient_problem_rating_id]);
    return true;
}
import pool from '../../services/database.js';

export async function createPatientProblem({ patient_id, title, description = '', status = 'active' }) {
    const sql = `INSERT INTO patient_problems (patient_id, title, description, status) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [patient_id, title, description, status]);
    return { patient_problem_id: result.insertId, patient_id, title, description, status };
}

export async function getPatientProblemsByPatient(patient_id) {
    const sql = `SELECT * FROM patient_problems WHERE patient_id = ? ORDER BY created_at DESC`;
    const [rows] = await pool.query(sql, [patient_id]);
    return rows;
}

export async function getPatientProblemById(patient_problem_id) {
    const sql = `SELECT * FROM patient_problems WHERE patient_problem_id = ?`;
    const [rows] = await pool.query(sql, [patient_problem_id]);
    return rows[0] || null;
}

export async function updatePatientProblem(patient_problem_id, updateData) {
    const fields = [];
    const values = [];
    for (const key in updateData) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
    }
    if (fields.length === 0) return false;
    values.push(patient_problem_id);
    const sql = `UPDATE patient_problems SET ${fields.join(', ')} WHERE patient_problem_id = ?`;
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
}

export async function deletePatientProblem(patient_problem_id) {
    const sql = `DELETE FROM patient_problems WHERE patient_problem_id = ?`;
    await pool.query(sql, [patient_problem_id]);
    return true;
}
