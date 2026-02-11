import pool from '../../services/database.js';

export async function getAllGroupsWithDepartment(organizationId = null) {
  let sql = `
    SELECT g.group_id, g.group_name, d.department_name
    FROM group_list g
    LEFT JOIN departments d ON g.department_id = d.department_id
  `;
  
  const params = [];
  if (organizationId) {
    sql += ' WHERE g.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY g.group_id';
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function addGroup({ group_name, department_id }, organizationId = null) {
  const sql = `
    INSERT INTO group_list (group_name, department_id, organization_id)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await pool.query(sql, [group_name, department_id, organizationId || null]);
    return { group_id: result.insertId, group_name, department_id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Group name must be unique');
    }
    throw error;
  }
}

export async function editGroup(group_id, { group_name, department_id }, organizationId = null) {
  let sql = `
    UPDATE group_list
    SET group_name = ?, department_id = ?
    WHERE group_id = ?
  `;
  const params = [group_name, department_id, group_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  try {
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) {
      throw new Error('Group not found or no changes made');
    }
    return { group_id, group_name, department_id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Group name must be unique');
    }
    throw error;
  }
}

export async function deleteGroupIfNoUsers(group_id, organizationId = null) {
  // בדוק אם יש משתמשים משויכים לקבוצה
  const checkSql = `SELECT COUNT(*) AS userCount FROM user_groups WHERE group_id = ?`;
  const [checkRows] = await pool.query(checkSql, [group_id]);
  if (checkRows[0].userCount > 0) {
    throw new Error('Cannot delete group: There are users linked to this group');
  }
  // מחק את הקבוצה
  let deleteSql = `DELETE FROM group_list WHERE group_id = ?`;
  const params = [group_id];
  
  if (organizationId) {
    deleteSql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [result] = await pool.query(deleteSql, params);
  if (result.affectedRows === 0) {
    throw new Error('Group not found or already deleted');
  }
  return { group_id };
}

export async function getGroupUsers(group_id, organizationId = null) {
  let sql = `
    SELECT u.user_id, u.email, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
    FROM users u 
    INNER JOIN user_groups ug ON u.person_id = ug.person_id
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE ug.group_id = ? AND u.role = 'patient'
  `;
  const params = [group_id];
  
  if (organizationId) {
    sql += ' AND u.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY p.last_name, p.first_name';
  
  const [rows] = await pool.query(sql, params);  
  return rows;
}

export async function getTherapistsByGroup(group_id, organizationId = null) {
  let sql = `
    SELECT u.user_id, u.email, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
    FROM users u 
    INNER JOIN user_groups ug ON u.person_id = ug.person_id
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE ug.group_id = ? AND u.role = 'therapist'
  `;
  const params = [group_id];
  
  if (organizationId) {
    sql += ' AND u.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY p.last_name, p.first_name';
  
  const [rows] = await pool.query(sql, params);  
  return rows;
}
