import pool from "../../services/database.js";

export async function create(patientData) {
  const { user_id, therapist_id, birth_date, gender, status, history_notes } = patientData;
  
  const query = `
    INSERT INTO Patients (user_id, therapist_id, birth_date, gender, status, history_notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  try {
    const [result] = await pool.execute(query, [
      user_id, 
      therapist_id, 
      birth_date, 
      gender, 
      status || 'פעיל', 
      history_notes || null
    ]);
    
    return {
      patient_id: result.insertId,
      user_id,
      therapist_id,
      birth_date,
      gender,
      status: status || 'פעיל',
      history_notes,
      message: "Patient created successfully"
    };
  } catch (error) {
    throw error;
  }
}


export async function getPatientsByTherapist(therapistId) {
  const sql = `
    SELECT
        U.user_id,
        U.first_name,
        U.last_name,
        U.teudat_zehut,
        U.phone,
        U.city,
        U.address,
        U.email,
        P.patient_id,
        P.birth_date,
        P.gender,
        P.status
    FROM Users AS U
    JOIN Patients AS P ON U.user_id = P.user_id
    WHERE P.therapist_id = ?;
  `;
  const [rows] = await pool.query(sql, [therapistId]);
  return rows;
}
export const getPatientDetails = async (patientId) => {
  const sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      TT.type_name AS treatment_type,
      R.room_name AS room,
      P.patient_id,
      U.first_name AS patient_first_name,
      U.last_name AS patient_last_name,
      P.birth_date,
      P.gender,
      P.status AS patient_status
    FROM Appointments AS A
    JOIN Patients AS P ON A.patient_id = P.patient_id
    JOIN Users AS U ON P.user_id = U.user_id
    JOIN TreatmentTypes AS TT ON A.type_id = TT.type_id
    JOIN Rooms AS R ON A.room_id = R.room_id
    WHERE A.patient_id = ? 
    ORDER BY A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [patientId]);
  return rows;
};

export const getPatientStats = async (patientId) => {
  const sql = `
    SELECT
      COUNT(appointment_id) AS total_appointments,
      SUM(total_minutes) AS total_treatment_minutes
    FROM Appointments
    WHERE patient_id = ?
  `;
  const [rows] = await pool.query(sql, [patientId]);
  return rows[0]; // מחזיר אובייקט אחד עם total_appointments ו-total_treatment_minutes
};