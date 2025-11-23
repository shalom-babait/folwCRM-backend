// מחזיר therapist_id לפי user_id
export async function getTherapistIdByUserId(user_id) {
  const query = `SELECT therapist_id FROM Therapists WHERE user_id = ? LIMIT 1`;
  const [rows] = await pool.execute(query, [user_id]);
  if (rows.length > 0) {
    return rows[0].therapist_id;
  }
  return null;
}

import pool, { deleteFromTable, updateTable } from "../../services/database.js";
import { create as createUser } from "../users/user.repo.js";

// therapistData: { user: { ...userData }, therapist: { ...otherTherapistData } }
export async function create(TherapistCreationData) {
  console.log("In therapists.repo.js - create function");
  const { user, therapist } = TherapistCreationData;

  try {
    // יצירת משתמש חדש
    const userResult = await createUser(user);
    const user_id = userResult.user_id;

    // יצירת מטפל עם user_id שנוצר
    const query = `
      INSERT INTO Therapists (user_id)
      VALUES (?)
    `;
    const [result] = await pool.execute(query, [user_id]);

    return {
      therapist_id: result.insertId,
      user_id,
      user: userResult,
      message: "Therapist and user created successfully"
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
        t.user_id,
        u.first_name,
        u.last_name,
        u.teudat_zehut,
        u.phone,
        u.city,
        u.address,
        u.email,
        u.role,
        u.agree,
        u.created_at
      FROM Therapists t
      INNER JOIN Users u ON t.user_id = u.user_id
      WHERE u.role = 'therapist'
      ORDER BY u.first_name, u.last_name
    `;
    const [rows] = await pool.execute(query);
    // החזרת מערך של TherapistCreationData עם שדות ריקים
    return rows.map(row => ({
      user: {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        teudat_zehut: row.teudat_zehut,
        phone: row.phone,
        city: row.city,
        address: row.address,
        email: row.email,
        role: row.role,
        agree: row.agree,
        created_at: row.created_at
      },
      therapist: {
        therapist_id: row.therapist_id,
        specialization: '',
        experience_years: null
      }
    }));
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
} 

export async function deleteFromTherapists(therapistId) {
  return deleteFromTable('Therapists', { therapist_id: therapistId });
}

export async function updateToTherapists(therapistId, updateData) {
  return updateTable('Therapists', updateData, { therapist_id: therapistId });
}