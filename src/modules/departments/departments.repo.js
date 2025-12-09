import pool from '../../services/database.js';
export async function getGroupsByDepartment(department_id) {
  const query = 'SELECT * FROM group_list WHERE department_id = ?';
  const [rows] = await pool.execute(query, [department_id]);
  return rows;
}
export async function deleteDepartmentIfNoGroups(department_id) {
  // בדוק אם קיימות קבוצות המקושרות למחלקה
  const [groups] = await pool.execute('SELECT group_id FROM group_list WHERE department_id = ?', [department_id]);
  if (groups.length > 0) {
    throw new Error('Cannot delete department: linked groups exist');
  }
  // מחק את המחלקה
  const [result] = await pool.execute('DELETE FROM departments WHERE department_id = ?', [department_id]);
  return result.affectedRows > 0;
}
export async function updateDepartment(department_id, department_name) {
  const query = 'UPDATE departments SET department_name = ? WHERE department_id = ?';
  const [result] = await pool.execute(query, [department_name, department_id]);
  return result.affectedRows > 0;
}

export async function getAllDepartments() {
  const query = 'SELECT department_id, department_name FROM departments';
  const [rows] = await pool.execute(query);
  return rows;
}

export async function insertDepartment(department_name) {
  const query = 'INSERT INTO departments (department_name) VALUES (?)';
  const [result] = await pool.execute(query, [department_name]);
  return { department_id: result.insertId, department_name };
}

// הצגת כל הקבוצות כולל שם המחלקה
export async function getAllGroupsWithDepartment() {
  const sql = `
    SELECT g.group_id, g.group_name, d.department_name
    FROM group_list g
    LEFT JOIN departments d ON g.department_id = d.department_id
    ORDER BY g.group_id;
  `;
  const [rows] = await pool.query(sql);
  console.log('getAllGroupsWithDepartment rows:', rows);  
  return rows;
}

export async function getDepartmentsWithGroups() {
  const sql = `
    SELECT d.department_id, d.department_name, g.group_id, g.group_name, g.created_at
    FROM departments d
    LEFT JOIN group_list g ON d.department_id = g.department_id
    ORDER BY d.department_id, g.group_id;
  `;
  const [rows] = await pool.query(sql);
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
