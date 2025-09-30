import pool from "../../services/database.js";

export async function getAppointmentsByPatientAndTherapist(patientId, therapistId) {
  const sql = `
    SELECT
        A.appointment_id,
        A.appointment_date,
        A.start_time,
        A.end_time,
        A.total_minutes,
        A.status,
        TT.type_name AS treatment_type,
        R.room_name AS room
    FROM
        Appointments AS A
    JOIN
        TreatmentTypes AS TT ON A.type_id = TT.type_id
    JOIN
        Rooms AS R ON A.room_id = R.room_id
    WHERE
        A.patient_id = ? AND A.therapist_id = ?
    ORDER BY
        A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [patientId, therapistId]);
  return rows;
}
