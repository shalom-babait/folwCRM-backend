/**
 * עדכון פגישה בטבלת appointments לפי מזהה
 * @param {number} appointmentId - מזהה הפגישה
 * @param {object} updateData - אובייקט עם השדות לעדכון
 * @param {number} organizationId - מזהה ארגון
 * @returns {Promise<object>} תוצאת העדכון
 */
export async function updateAppointmentRepo(appointmentId, updateData, organizationId = null) {
  if (!appointmentId || typeof appointmentId !== 'number') {
    throw new Error('Invalid appointmentId');
  }
  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('No update data provided');
  }

  // בניית חלק ה-SET הדינמי
  const fields = Object.keys(updateData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateData[field]);
  values.push(appointmentId);

  let sql = `UPDATE appointments SET ${setClause} WHERE appointment_id = ?`;
  
  if (organizationId) {
    sql += ' AND organization_id = ?';
    values.push(organizationId);
  }
  
  try {
    const [result] = await pool.query(sql, values);
    return result;
  } catch (err) {
    console.error('Error updating appointment:', err);
    throw err;
  }
}
import Joi from "joi";
const { not } = Joi;
import pool, { deleteFromTable, updateTable } from "../../services/database.js";

/**
 * עדכון פגישה בטבלת appointments לפי מזהה
 * @param {number} appointmentId - מזהה הפגישה
 * @param {object} updateData - אובייקט עם השדות לעדכון
 * @returns {Promise<object>} תוצאת העדכון
 */
export async function updateAppointment(appointmentId, updateData) {
  if (!appointmentId || isNaN(appointmentId)) {
    throw new Error('Invalid appointmentId');
  }
  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('No update data provided');
  }
  const fields = Object.keys(updateData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateData[field]);
  values.push(appointmentId);
  const sql = `UPDATE appointments SET ${setClause} WHERE appointment_id = ?`;
  try {
    const [result] = await pool.query(sql, values);
    return result;
  } catch (err) {
    console.error('Error updating appointment:', err);
    throw err;
  }
}

// שליפת כל הפגישות של קבוצה מסוימת
export async function getAppointmentsByGroupId(groupId, organizationId = null) {
  let sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      A.notes,
      GL.group_name AS group_name,
      R.room_name AS room,
      A.patient_id,
      A.therapist_id,
      CONCAT(P.first_name, ' ', P.last_name) AS therapist_name
    FROM
      appointments AS A
      LEFT JOIN group_list AS GL ON A.treatment_type_id = GL.group_id
      LEFT JOIN rooms AS R ON A.room_id = R.room_id
      LEFT JOIN therapists AS T ON A.therapist_id = T.therapist_id
      LEFT JOIN users AS U ON T.user_id = U.user_id
      LEFT JOIN person AS P ON U.person_id = P.person_id
    WHERE
      A.treatment_type_id = ?`;
  
  const params = [groupId];
  
  if (organizationId) {
    sql += ' AND A.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY A.appointment_date, A.start_time;';
  
  const [rows] = await pool.query(sql, params);
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
//       appointments AS A
//     LEFT JOIN group_list AS GL ON A.treatment_type_id = GL.group_id
//     JOIN rooms AS R ON A.room_id = R.room_id
//     JOIN therapists AS T ON A.therapist_id = T.therapist_id
//     JOIN users AS U ON T.user_id = U.user_id
//     WHERE
//       A.treatment_type_id = ?
//     ORDER BY
//       A.appointment_date, A.start_time;
// שליפת כל הפגישות של מטפל בלבד
export async function getAppointmentsByTherapist(therapistId, organizationId = null) {
  let sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      A.notes,
      GL.group_name AS group_name,
      R.room_name AS room,
      A.patient_id,
      CONCAT(P.first_name, ' ', P.last_name) AS patient_name
    FROM appointments AS A
    LEFT JOIN group_list AS GL
      ON A.treatment_type_id = GL.group_id
    JOIN rooms AS R
      ON A.room_id = R.room_id
    LEFT JOIN patients AS PA
      ON PA.patient_id = A.patient_id
    LEFT JOIN person AS P
      ON P.person_id = PA.person_id
    WHERE A.therapist_id = ?`;
  
  const params = [therapistId];
  
  if (organizationId) {
    sql += ' AND A.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY A.appointment_date, A.start_time;';

  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('SQL ERROR:', err);
    throw err;
  }
}

export async function getAppointmentsByRoom(roomId, organizationId = null) {
  let sql = `
    SELECT
      A.*, CONCAT(P.first_name, ' ', P.last_name) AS therapist_name
    FROM appointments AS A
    JOIN therapists AS T ON A.therapist_id = T.therapist_id
    JOIN users AS U ON T.user_id = U.user_id
    JOIN person AS P ON U.person_id = P.person_id
    WHERE A.room_id = ?`;
  
  const params = [roomId];
  
  if (organizationId) {
    sql += ' AND A.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY A.appointment_date, A.start_time;';
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function create(appointmentData) {
  const {
    therapist_id,
    patient_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes,
    organization_id
  } = appointmentData;
  // אם treatment_type_id ריק או לא קיים, נכניס null
  const treatment_type_id = appointmentData.treatment_type_id ? appointmentData.treatment_type_id : null;
  // אם room_id ריק או 0, נכניס null
  const room_id = appointmentData.room_id && appointmentData.room_id !== 0 ? appointmentData.room_id : null;

  const query = `
    INSERT INTO appointments 
    (therapist_id, patient_id, treatment_type_id, room_id, appointment_date, start_time, end_time, status, notes, organization_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.execute(query, [
      therapist_id,
      patient_id,
      treatment_type_id,
      room_id,
      appointment_date,
      start_time,
      end_time,
      status || 'מתוזמנת',
      notes || null,
      organization_id || null
    ]);

    return {
      appointment_id: result.insertId,
      therapist_id,
      patient_id,
      treatment_type_id,
      room_id,
      appointment_date,
      start_time,
      end_time,
      status: status || 'מתוזמנת',
      notes: notes || null,
      message: "Appointment created successfully"
    };
  } catch (error) {
    throw error;
  }
}

// ניתן להעביר appointmentId כדי לא לכלול את הפגישה הנוכחית בבדיקת חפיפה
export async function checkTimeConflict(therapist_id, room_id, appointment_date, start_time, end_time, appointmentIdToExclude = null, organizationId = null) {
  let query = `
    SELECT appointment_id FROM appointments 
    WHERE (therapist_id = ? OR room_id = ?) 
      AND appointment_date = ? 
      AND status != 'בוטלה'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )`;
  const params = [
    therapist_id, room_id, appointment_date,
    start_time, start_time,
    end_time, end_time,
    start_time, end_time
  ];
  
  if (organizationId) {
    query += ' AND organization_id = ?';
    params.push(organizationId);
  }
  
  if (appointmentIdToExclude) {
    query += ' AND appointment_id != ?';
    params.push(appointmentIdToExclude);
  }
  try {
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
}


export async function getAppointmentsByPatientAndTherapist(patientId, therapistId, organizationId = null) {
  let sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      A.notes,
      GL.group_name AS group_name
    FROM
      appointments AS A
    LEFT JOIN group_list AS GL ON A.treatment_type_id = GL.group_id
    WHERE
      A.patient_id = ? AND A.therapist_id = ?`;
  
  const params = [patientId, therapistId];
  
  if (organizationId) {
    sql += ' AND A.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY A.appointment_date, A.start_time;';
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function deleteFromAppointments(appointmentId, organizationId = null) {
  if (organizationId) {
    const sql = 'DELETE FROM appointments WHERE appointment_id = ? AND organization_id = ?';
    const [result] = await pool.query(sql, [appointmentId, organizationId]);
    return result;
  }
  return deleteFromTable('appointments', { appointment_id: appointmentId });
}

export async function updateToAppointments(appointmentId, updateData) {
  return updateTable('appointments', updateData, { appointment_id: appointmentId });
}

export async function getAppointmentsByPatientId(patient_id, organizationId = null) {
  let sql = `
    SELECT
      A.appointment_id,
      DATE_FORMAT(A.appointment_date, '%Y-%m-%d') AS appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      A.notes,
      GL.group_name AS group_name,
      R.room_name AS room,
      A.patient_id,
      A.therapist_id,
      CONCAT(P.first_name, ' ', P.last_name) AS therapist_name,
      P.first_name AS therapist_first_name,
      P.last_name AS therapist_last_name,
      TT.type_name
    FROM appointments AS A
    LEFT JOIN treatment_types AS TT ON A.treatment_type_id = TT.treatment_type_id
    LEFT JOIN group_list AS GL ON A.treatment_type_id = GL.group_id
    LEFT JOIN rooms AS R ON A.room_id = R.room_id
    LEFT JOIN therapists AS T ON A.therapist_id = T.therapist_id
    LEFT JOIN users AS U ON T.user_id = U.user_id
    LEFT JOIN person AS P ON U.person_id = P.person_id
    WHERE A.patient_id = ?`;
  
  const params = [patient_id];
  
  if (organizationId) {
    sql += ' AND A.organization_id = ?';
    params.push(organizationId);
  }
  
  sql += ' ORDER BY A.appointment_date DESC, A.start_time DESC;';

  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * שליפת פגישות שמתקיימות בעוד 24 שעות (עם פרטי מטפל ומטופל)
 * @returns {Promise<Array>} רשימת פגישות עם פרטי קשר
 */
export async function getAppointmentsForReminders() {
  const sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.status,
      A.notes,
      
      -- פרטי המטפל
      A.therapist_id,
      CONCAT(PT.first_name, ' ', PT.last_name) AS therapist_name,
      PT.email AS therapist_email,
      PT.phone AS therapist_phone,
      
      -- פרטי המטופל
      A.patient_id,
      CONCAT(PP.first_name, ' ', PP.last_name) AS patient_name,
      PP.email AS patient_email,
      PP.phone AS patient_phone,
      
      -- פרטים נוספים
      R.room_name,
      GL.group_name,
      TT.type_name
      
    FROM appointments AS A
    
    -- חיבור למטפל
    LEFT JOIN therapists AS T ON A.therapist_id = T.therapist_id
    LEFT JOIN users AS UT ON T.user_id = UT.user_id
    LEFT JOIN person AS PT ON UT.person_id = PT.person_id
    
    -- חיבור למטופל
    LEFT JOIN patients AS PAT ON A.patient_id = PAT.patient_id
    LEFT JOIN person AS PP ON PAT.person_id = PP.person_id
    
    -- פרטים נוספים
    LEFT JOIN rooms AS R ON A.room_id = R.room_id
    LEFT JOIN group_list AS GL ON A.treatment_type_id = GL.group_id
    LEFT JOIN treatment_types AS TT ON A.treatment_type_id = TT.treatment_type_id
    
    WHERE 
      A.status IN ('מתוזמנת', 'מאושרת')
      AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(A.appointment_date, ' ', A.start_time)) BETWEEN 12 AND 36
      
    ORDER BY A.appointment_date, A.start_time;
  `;

  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    console.error('Error fetching appointments for reminders:', err);
    throw err;
  }
}



