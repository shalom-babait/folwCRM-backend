import pool from '../../services/database.js';
export async function getGroupsByDepartment(department_id, organizationId = null) {
  let query = 'SELECT * FROM group_list WHERE department_id = ?';
  const params = [department_id];
  
  if (organizationId) {
    query += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.execute(query, params);
  return rows;
}
export async function deleteDepartmentIfNoGroups(department_id, organizationId = null) {
  // בדוק אם קיימות קבוצות המקושרות למחלקה
  const [groups] = await pool.execute('SELECT group_id FROM group_list WHERE department_id = ?', [department_id]);
  if (groups.length > 0) {
    throw new Error('Cannot delete department: linked groups exist');
  }
  // מחק את המחלקה
  let sql = 'DELETE FROM departments WHERE department_id = ?';
  const params = [department_id];
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [result] = await pool.execute(sql, params);
  return result.affectedRows > 0;
}
export async function updateDepartment(department_id, department_name, organizationId = null) {
  let query = 'UPDATE departments SET department_name = ? WHERE department_id = ?';
  const params = [department_name, department_id];
  
  if (organizationId) {
    query += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  const [result] = await pool.execute(query, params);
  return result.affectedRows > 0;
}

export async function getAllDepartments(organizationId = null) {
  let query = 'SELECT department_id, department_name FROM departments';
  const params = [];
  
  if (organizationId) {
    query += ' WHERE organization_id = ?';
    params.push(organizationId);
  }
  
  const [rows] = await pool.execute(query, params);
  return rows;
}

export async function insertDepartment(department_name, organizationId = null) {
  const query = 'INSERT INTO departments (department_name, organization_id) VALUES (?, ?)';
  const [result] = await pool.execute(query, [department_name, organizationId || null]);
  return { department_id: result.insertId, department_name };
}

// הצגת כל הקבוצות כולל שם המחלקה
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
  console.log('getAllGroupsWithDepartment rows:', rows);  
  return rows;
}

export async function getDepartmentsWithGroups(organizationId = null) {
  let sql = `
    SELECT d.department_id, d.department_name, g.group_id, g.group_name, g.created_at
    FROM departments d
    LEFT JOIN group_list g ON d.department_id = g.department_id
  `;
  
  const params = [];
  if (organizationId) {
    sql += ' WHERE d.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY d.department_id, g.group_id';
  
  const [rows] = await pool.query(sql, params);
  // console.log('getDepartmentsWithGroups rows:', rows);  
  // עיבוד התוצאה למבנה DepartmentWithGroups
  const departmentsMap = new Map();
  for (const row of rows) {
    if (!departmentsMap.has(row.department_id)) {
      departmentsMap.set(row.department_id, {
        department: {
          department_id: row.department_id,
          department_name: row.department_name
        },
        groups: []
      });
    }
    if (row.group_id) {
      departmentsMap.get(row.department_id).groups.push({
        group_id: row.group_id,
        group_name: row.group_name,
        department_id: row.department_id,
        created_at: row.created_at
      });
    }
  }
  // console.log('Processed departmentsWithGroups:', Array.from(departmentsMap.values())); 
  return Array.from(departmentsMap.values());
}
