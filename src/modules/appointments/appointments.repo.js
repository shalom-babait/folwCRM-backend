import pool, { deleteFromTable, updateTable } from "../../services/database.js";

// שליפת כל הפגישות של קבוצה מסוימת
export async function getAppointmentsByGroupId(groupId) {
  const sql = `
    SELECT
  A.appointment_id,
  A.appointment_date,
  A.start_time,
  A.end_time,
  A.total_minutes,
  A.status,
  GL.group_name AS group_name,
  R.room_name AS room,
  A.patient_id,
  A.therapist_id,
  CONCAT(P.first_name, ' ', P.last_name) AS therapist_name
FROM
  Appointments AS A
LEFT JOIN group_list AS GL ON A.type_id = GL.group_id
LEFT JOIN Rooms AS R ON A.room_id = R.room_id
LEFT JOIN Therapists AS T ON A.therapist_id = T.therapist_id
LEFT JOIN Users AS U ON T.user_id = U.user_id
LEFT JOIN person AS P ON U.person_id = P.person_id
WHERE
  A.type_id = ?
ORDER BY
  A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [groupId]);
  return rows;
}
// SELECT
//       A.appointment_id,
//       A.appointment_date,
//       A.start_time,
//       A.end_time,
//       A.total_minutes,
//       A.status,
//       GL.group_name AS group_name,
//       R.room_name AS room,
//       A.patient_id,
//       A.therapist_id,
//       CONCAT(U.first_name, ' ', U.last_name) AS therapist_name
//     FROM
//       Appointments AS A
//     LEFT JOIN group_list AS GL ON A.type_id = GL.group_id
//     JOIN Rooms AS R ON A.room_id = R.room_id
//     JOIN Therapists AS T ON A.therapist_id = T.therapist_id
//     JOIN Users AS U ON T.user_id = U.user_id
//     WHERE
//       A.type_id = ?
//     ORDER BY
//       A.appointment_date, A.start_time;
// שליפת כל הפגישות של מטפל בלבד
export async function getAppointmentsByTherapist(therapistId) {
  const sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      GL.group_name AS group_name,
      R.room_name AS room,
      A.patient_id
    FROM
      Appointments AS A
   -- LEFT JOIN TreatmentTypes AS TT ON A.type_id = TT.type_id
    LEFT JOIN group_list AS GL ON A.type_id = GL.group_id
    JOIN Rooms AS R ON A.room_id = R.room_id
    WHERE
      A.therapist_id = ?
    ORDER BY
      A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [therapistId]);
  return rows;
}

export async function getAppointmentsByRoom(roomId) {
  const sql = `
    SELECT
      A.*, CONCAT(P.first_name, ' ', P.last_name) AS therapist_name
    FROM Appointments AS A
    JOIN Therapists AS T ON A.therapist_id = T.therapist_id
    JOIN Users AS U ON T.user_id = U.user_id
    JOIN person AS P ON U.person_id = P.person_id
    WHERE A.room_id = ?
    ORDER BY A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [roomId]);
  return rows;
}

export async function create(appointmentData) {
  const {
    therapist_id,
    patient_id,
    type_id,
    room_id,
    appointment_date,
    start_time,
    end_time,
    status
  } = appointmentData;

  const query = `
    INSERT INTO Appointments 
    (therapist_id, patient_id, type_id, room_id, appointment_date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.execute(query, [
      therapist_id,
      patient_id,
      type_id,
      room_id,
      appointment_date,
      start_time,
      end_time,
      status || 'מתוזמנת'
    ]);

    return {
      appointment_id: result.insertId,
      therapist_id,
      patient_id,
      type_id,
      room_id,
      appointment_date,
      start_time,
      end_time,
      status: status || 'מתוזמנת',
      message: "Appointment created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function checkTimeConflict(therapist_id, room_id, appointment_date, start_time, end_time) {
  const query = `
    SELECT appointment_id FROM Appointments 
    WHERE (therapist_id = ? OR room_id = ?) 
      AND appointment_date = ? 
      AND status != 'בוטלה'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
  `;

  try {
    const [rows] = await pool.execute(query, [
      therapist_id, room_id, appointment_date,
      start_time, start_time,  // חפיפה מתחילת התור החדש
      end_time, end_time,      // חפיפה מסוף התור החדש
      start_time, end_time     // התור החדש מכיל תור קיים
    ]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
}


export async function getAppointmentsByPatientAndTherapist(patientId, therapistId) {
  const sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      GL.group_name AS group_name,
      R.room_name AS room
    FROM
      Appointments AS A
    LEFT JOIN group_list AS GL ON A.type_id = GL.group_id
    JOIN Rooms AS R ON A.room_id = R.room_id
    WHERE
      A.patient_id = ? AND A.therapist_id = ?
    ORDER BY
      A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [patientId, therapistId]);
  return rows;
}

export async function deleteFromAppointments(appointmentId) {
  return deleteFromTable('Appointments', { appointment_id: appointmentId });
}

export async function updateToAppointments(appointmentId, updateData) {
  return updateTable('Appointments', updateData, { appointment_id: appointmentId });
}

export async function getAppointmentsByPatientId(patient_id) {
  const sql = `
    SELECT
      A.appointment_id,
      DATE_FORMAT(A.appointment_date, '%Y-%m-%d') AS appointment_date,
      A.start_time,
      CONCAT(P.first_name, ' ', P.last_name) AS therapist_name,
      P.first_name AS therapist_first_name,
      P.last_name AS therapist_last_name,
      TT.type_name
    FROM Appointments AS A
    LEFT JOIN treatmenttypes AS TT ON A.type_id = TT.type_id
    LEFT JOIN Therapists AS T ON A.therapist_id = T.therapist_id
    LEFT JOIN Users AS U ON T.user_id = U.user_id
    LEFT JOIN person AS P ON U.person_id = P.person_id
    WHERE A.patient_id = ?
    ORDER BY A.appointment_date DESC, A.start_time DESC;
  `;

  const [rows] = await pool.query(sql, [patient_id]);
  return rows;
}


