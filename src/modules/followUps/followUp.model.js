// שליפת כל המעקבים שנוצרו ע"י משתמש מסוים, תאריך היום ומעלה, כולל כל שדות המעקב וכל שדות הפרסון
export async function getUpcomingFollowUpsByCreator(user_id, organizationId = null) {
    // console.log(user_id, "      user_id");
    let sql = `
      SELECT f.*, p.*
      FROM followups f
      JOIN person p ON f.person_id = p.person_id
      WHERE f.created_by_user_id = ?
        AND f.follow_date <= CURDATE()
        AND f.status = 'open'
    `;
    const params = [user_id];
    
    if (organizationId) {
      sql += ' AND f.organization_id = ?';
      params.push(organizationId);
    }
    
    sql += ' ORDER BY f.follow_date ASC, f.follow_time ASC';
    
    const [rows] = await pool.query(sql, params);
    // console.log("rows", rows);



    // separate followUp and person fields
    return rows.map(row => {
        const followUp = {
            followup_id: row.followup_id,
            person_id: row.person_id,
            created_by_user_id: row.created_by_user_id,
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

export async function createFollowUp({ person_id, follow_date, follow_time = null, remind = false, notes = '', created_by_user_id }, organizationId = null) {
    const sql = `INSERT INTO followups (person_id, follow_date, follow_time, remind, notes, created_by_user_id, status, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    // default status to 'open' if not provided
    const status = arguments[0]?.status || 'open';
    const [result] = await pool.query(sql, [person_id, follow_date, follow_time, remind, notes, created_by_user_id, status, organizationId || null]);
    return { followup_id: result.insertId, person_id, follow_date, follow_time, remind, notes, created_by_user_id, status };
}

export async function getFollowUpsByPerson(person_id, organizationId = null) {
    let sql = `SELECT * FROM followups WHERE person_id = ?`;
    const params = [person_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    sql += ' ORDER BY follow_date DESC';
    
    const [rows] = await pool.query(sql, params);
    return rows.map(row => ({
        ...row,
        status: row.status
    }));
}

export async function getFollowUpById(followup_id, organizationId = null) {
    let sql = `SELECT * FROM followups WHERE followup_id = ?`;
    const params = [followup_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    const [rows] = await pool.query(sql, params);
    if (!rows[0]) return null;
    return {
        ...rows[0],
        status: rows[0].status
    };
}

export async function updateFollowUp(followup_id, updateData, organizationId = null) {
    const fields = [];
    const values = [];
    for (const key in updateData) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
    }
    if (fields.length === 0) return false;
    
    let sql = `UPDATE followups SET ${fields.join(', ')} WHERE followup_id = ?`;
    values.push(followup_id);
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      values.push(organizationId);
    }
    
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
}

export async function deleteFollowUp(followup_id, organizationId = null) {
    let sql = `DELETE FROM followups WHERE followup_id = ?`;
    const params = [followup_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    const [result] = await pool.query(sql, params);
    return result.affectedRows > 0;
}
