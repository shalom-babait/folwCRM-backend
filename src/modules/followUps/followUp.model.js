// שליפת כל המעקבים שנוצרו ע"י משתמש מסוים, תאריך היום ומעלה, כולל כל שדות המעקב וכל שדות הפרסון
export async function getUpcomingFollowUpsByCreator(created_by_person_id) {
        const sql = `
            SELECT f.*, p.*
            FROM FollowUps f
            JOIN Person p ON f.person_id = p.person_id
            WHERE f.created_by_person_id = ?
              AND f.follow_date >= CURDATE()
            ORDER BY f.follow_date ASC, f.follow_time ASC
        `;
        const [rows] = await pool.query(sql, [created_by_person_id]);
        // separate followUp and person fields
        return rows.map(row => {
            const followUp = {
                followup_id: row.followup_id,
                person_id: row.person_id,
                created_by_person_id: row.created_by_person_id,
                follow_date: row.follow_date,
                follow_time: row.follow_time,
                remind: row.remind,
                notes: row.notes,
                created_at: row.created_at
            };
            const person = {};
            for (const key in row) {
                if (!(key in followUp)) {
                    person[key] = row[key];
                }
            }
            return { followUp, person };
        });
}
import pool from '../../services/database.js';

export async function createFollowUp({ person_id, follow_date, follow_time = null, remind = false, notes = '', created_by_person_id }) {
    const sql = `INSERT INTO FollowUps (person_id, follow_date, follow_time, remind, notes, created_by_person_id) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [person_id, follow_date, follow_time, remind, notes, created_by_person_id]);
    return { followup_id: result.insertId, person_id, follow_date, follow_time, remind, notes, created_by_person_id };
}

export async function getFollowUpsByPerson(person_id) {
    const sql = `SELECT * FROM FollowUps WHERE person_id = ? ORDER BY follow_date DESC`;
    const [rows] = await pool.query(sql, [person_id]);
    return rows;
}

export async function getFollowUpById(followup_id) {
    const sql = `SELECT * FROM FollowUps WHERE followup_id = ?`;
    const [rows] = await pool.query(sql, [followup_id]);
    return rows[0] || null;
}

export async function updateFollowUp(followup_id, updateData) {
    const fields = [];
    const values = [];
    for (const key in updateData) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
    }
    if (fields.length === 0) return false;
    const sql = `UPDATE FollowUps SET ${fields.join(', ')} WHERE followup_id = ?`;
    values.push(followup_id);
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
}

export async function deleteFollowUp(followup_id) {
    const sql = `DELETE FROM FollowUps WHERE followup_id = ?`;
    const [result] = await pool.query(sql, [followup_id]);
    return result.affectedRows > 0;
}
