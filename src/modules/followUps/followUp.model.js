// שליפת כל המעקבים שנוצרו ע"י משתמש מסוים, תאריך היום ומעלה, כולל כל שדות המעקב וכל שדות הפרסון
export async function getUpcomingFollowUpsByCreator(user_id) {
    console.log(user_id, "      user_id");

    const sql = `
        SELECT f.*, p.*
        FROM followups f
        JOIN person p ON f.person_id = p.person_id
        JOIN users u ON f.created_by_person_id = u.person_id
        WHERE u.user_id = ?
          AND f.follow_date >= CURDATE()
          AND f.status = 'open'
        ORDER BY f.follow_date ASC, f.follow_time ASC
    `;
    const [rows] = await pool.query(sql, [user_id]);
   

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
            created_at: row.created_at,
            status: row.status
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
    const sql = `INSERT INTO followups (person_id, follow_date, follow_time, remind, notes, created_by_person_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    // default status to 'open' if not provided
    const status = arguments[0]?.status || 'open';
    const [result] = await pool.query(sql, [person_id, follow_date, follow_time, remind, notes, created_by_person_id, status]);
    return { followup_id: result.insertId, person_id, follow_date, follow_time, remind, notes, created_by_person_id, status };
}

export async function getFollowUpsByPerson(person_id) {
    const sql = `SELECT * FROM followups WHERE person_id = ? ORDER BY follow_date DESC`;
    const [rows] = await pool.query(sql, [person_id]);
    return rows.map(row => ({
        ...row,
        status: row.status
    }));
}

export async function getFollowUpById(followup_id) {
    const sql = `SELECT * FROM followups WHERE followup_id = ?`;
    const [rows] = await pool.query(sql, [followup_id]);
    if (!rows[0]) return null;
    return {
        ...rows[0],
        status: rows[0].status
    };
}

export async function updateFollowUp(followup_id, updateData) {
    const fields = [];
    const values = [];
    for (const key in updateData) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
    }
    if (fields.length === 0) return false;
    const sql = `UPDATE followups SET ${fields.join(', ')} WHERE followup_id = ?`;
    values.push(followup_id);
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
}

export async function deleteFollowUp(followup_id) {
    const sql = `DELETE FROM followups WHERE followup_id = ?`;
    const [result] = await pool.query(sql, [followup_id]);
    return result.affectedRows > 0;
}
