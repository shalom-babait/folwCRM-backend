import pool from "../../services/database.js";

/**
 * שליפת כל המתעניינים
 */
export async function getAllProspects() {
  const sql = "SELECT * FROM Prospects ORDER BY created_at DESC";
  const [rows] = await pool.query(sql);
  return rows;
}

/**
 * יצירת prospect חדש בטבלת Prospects
 */
export async function createProspect(prospectData) {
  const {
    first_name,
    last_name,
    phone,
    phone_alt,
    email,
    city,
    referral_source,
    reason_for_visit,
    notes,
    status,
    converted_to_patient_id
  } = prospectData;
  const sql = `
    INSERT INTO Prospects (
      first_name, last_name, phone, phone_alt, email, city, referral_source, reason_for_visit, notes, status, converted_to_patient_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    phone,
    phone_alt || null,
    email || null,
    city || null,
    referral_source || null,
    reason_for_visit || null,
    notes || null,
    status || 'new',
    converted_to_patient_id || null
  ];
  try {
    const [result] = await pool.execute(sql, values);
    return {
      prospect_id: result.insertId,
      ...prospectData
    };
  } catch (error) {
    throw error;
  }
}
