import pool, { deleteFromTable, updateTable } from "../../services/database.js";
export async function getTypes(patientId) {
  try {
    if (!patientId || isNaN(patientId)) {
      throw new Error('Missing or invalid patientId');
    }
    const query = `
      SELECT gl.group_id, gl.group_name
      FROM user_groups ug
      JOIN patients p ON ug.person_id = p.person_id
      JOIN group_list gl ON ug.group_id = gl.group_id
      WHERE p.patient_id = ?;
    `;
    const [rows] = await pool.execute(query, [Number(patientId)]);
    return rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function create(typeData) {
  const { type_name } = typeData;

  const query = `
    INSERT INTO treatment_types (type_name)
    VALUES (?)
  `;

  try {
    const [result] = await pool.execute(query, [type_name]);
    return {
      type_id: result.insertId,
      type_name,
      message: "type created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteFromTypes(typeId) {
  return deleteFromTable('treatment_types', { type_id: typeId });
}

export async function updateToTypes(typeId, updateData) {
  return updateTable('treatment_types', updateData, { type_id: typeId });
}