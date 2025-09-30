import pool from "../../services/database.js";

export async function create(therapistData) {
  const { user_id } = therapistData;

  const query = `
    INSERT INTO Therapists (user_id)
    VALUES (?)
  `;

  try {
    const [result] = await pool.execute(query, [user_id]);
    return {
      therapist_id: result.insertId,
      user_id,
      message: "Therapist created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function getTherapists() {
  try {
    const query = `
        SELECT 
          t.therapist_id,
          CONCAT(u.first_name, ' ', u.last_name) as full_name
        FROM Therapists t
        INNER JOIN Users u ON t.user_id = u.user_id
        WHERE u.role = 'מטפל'
        ORDER BY u.first_name, u.last_name
      `;

    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
} 