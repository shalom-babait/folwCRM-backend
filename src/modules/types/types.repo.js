import pool from "../../services/database.js";

export async function getTypes() {
  try {
    const query = `
        SELECT * FROM TreatmentTypes
      `;

    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
} 

export async function create(typeData) {
  const { type_name } = typeData;

  const query = `
    INSERT INTO TreatmentTypes (type_name)
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
