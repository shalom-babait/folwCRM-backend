export async function getPatientFullData(patientId) {
  // שליפת נתוני משתמש ומטופל כולל JOIN ל-Person
  const userPatientSql = `
    SELECT U.user_id, U.email, U.role, U.agree, U.created_at, U.person_id,
           P.patient_id, P.therapist_id, P.birth_date AS patient_birth_date, P.gender AS patient_gender, P.status AS patient_status, P.history_notes,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender
    FROM Users U
    JOIN Patients P ON U.user_id = P.user_id
    LEFT JOIN Person PR ON U.person_id = PR.person_id
    WHERE P.patient_id = ?
  `;
  const [fullRows] = await pool.query(userPatientSql, [patientId]);
  if (!fullRows.length) return null;
  const userRow = fullRows[0];

  // שליפת שיוך למחלקות וקבוצות
  const departmentsSql = `
    SELECT UD.department_id, GL.group_id
    FROM UserDepartments UD
    LEFT JOIN UserGroups UG ON UD.user_id = UG.user_id
    LEFT JOIN group_list GL ON UG.group_id = GL.group_id AND GL.department_id = UD.department_id
    WHERE UD.user_id = ?
  `;
  const [depRowsFull] = await pool.query(departmentsSql, [userRow.user_id]);

  // בניית מערך מחלקות וקבוצות
  const depMap = new Map();
  for (const row of depRowsFull) {
    if (!row.department_id) continue;
    if (!depMap.has(row.department_id)) depMap.set(row.department_id, []);
    if (row.group_id) depMap.get(row.department_id).push(row.group_id);
  }
  const selectedDepartments = Array.from(depMap.entries()).map(([department_id, group_ids]) => ({ department_id, group_ids }));

  // בניית אובייקט לתשובה
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.email, U.role, U.agree, U.created_at
    FROM Patients P
    LEFT JOIN Users U ON P.user_id = U.user_id
    LEFT JOIN Person PR ON P.person_id = PR.person_id
    WHERE P.therapist_id = ?
  `;
  const [userRows] = await pool.query(sql, [therapistId]);
  if (!userRows.length) return [];
  // ...existing code...
  // בניית person
  const person = {
    person_id: userRow.person_id,
    first_name: userRow.first_name || '',
    last_name: userRow.last_name || '',
    teudat_zehut: userRow.teudat_zehut || '',
    phone: userRow.phone || '',
    city: userRow.city || '',
    address: userRow.address || '',
    birth_date: userRow.birth_date || '',
    gender: userRow.gender || 'other'
  };
  const patient = {
    patient_id: userRow.patient_id,
    user_id: userRow.user_id,
    therapist_id: userRow.therapist_id,
    birth_date: userRow.patient_birth_date,
    gender: userRow.patient_gender,
    status: userRow.patient_status,
    history_notes: userRow.history_notes
  };
  return { person, patient, selectedDepartments };
}
/**
 * יצירת משתמש חדש בטבלת Users
 */
export async function createUser(userData) {
  const { first_name, last_name, teudat_zehut, phone, city, address, email, password } = userData;
  // אם לא נשלח password, נשתמש בערך ברירת מחדל
  const userPassword = password || 'temp1234';
  const query = `
    INSERT INTO Users (first_name, last_name, teudat_zehut, phone, city, address, email, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await pool.execute(query, [
      first_name,
      last_name,
      teudat_zehut || null,
      phone || null,
      city || null,
      address || null,
      email,
      userPassword
    ]);
    return {
      user_id: result.insertId,
      first_name,
      last_name,
      teudat_zehut,
      phone,
      city,
      address,
      email,
      password: userPassword
    };
  } catch (error) {
    throw error;
  }
}

import pool, { deleteFromTable, updateTable } from "../../services/database.js";

/**
 * שליפת נתוני מטופל בלבד לפי מזהה
 */
export const getPatientOnly = async (patientId) => {
  const sql = `
    SELECT 
      P.patient_id,
      P.user_id,
      P.therapist_id,
      PR.first_name,
      PR.last_name,
      P.birth_date,
      P.gender,
      P.status,
      P.history_notes,
      PR.address,
      PR.city,
      PR.phone,
      U.email,
      PR.teudat_zehut
    FROM Patients AS P
    JOIN Users AS U ON P.user_id = U.user_id
    LEFT JOIN Person PR ON U.person_id = PR.person_id
    WHERE P.user_id = ?
  `;
  const [rows] = await pool.query(sql, [patientId]);
  return rows[0] || null;
};

/**
 * יצירת מטופל חדש בטבלת Patients
 */
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


/**
 * שליפת כל המטופלים של מטפל
 */
export async function getPatientsByTherapist(therapistId) {
  // שליפת כל המטופלים של המטפל כולל JOIN ל-Person
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.email, U.role, U.agree, U.created_at
    FROM Patients P
    LEFT JOIN Users U ON P.user_id = U.user_id
    LEFT JOIN Person PR ON P.person_id = PR.person_id
    WHERE P.therapist_id = ?
  `;
  const [therapistRows] = await pool.query(sql, [therapistId]);
  if (!therapistRows.length) return [];

  // שליפת כל שיוכי מחלקות וקבוצות לכל המטופלים לפי person_id
  const personIds = therapistRows.map(row => row.person_id);
  if (personIds.length === 0) return [];
  const departmentsSql = `
    SELECT UD.person_id, UD.department_id, GL.group_id
    FROM UserDepartments UD
    LEFT JOIN UserGroups UG ON UD.person_id = UG.person_id
    LEFT JOIN group_list GL ON UG.group_id = GL.group_id AND GL.department_id = UD.department_id
    WHERE UD.person_id IN (${personIds.map(() => '?').join(',')})
  `;
  const [depRowsTherapist] = await pool.query(departmentsSql, personIds);

  // בניית מפה של מחלקות וקבוצות לכל person
  const depMap = new Map();
  for (const row of depRowsTherapist) {
    if (!row.person_id || !row.department_id) continue;
    if (!depMap.has(row.person_id)) depMap.set(row.person_id, new Map());
    const personDepMap = depMap.get(row.person_id);
    if (!personDepMap.has(row.department_id)) personDepMap.set(row.department_id, []);
    if (row.group_id) personDepMap.get(row.department_id).push(row.group_id);
  }

  // בניית מערך התוצאה
  return therapistRows.map(row => {
    const person = {
      person_id: row.person_id,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      teudat_zehut: row.teudat_zehut || '',
      phone: row.phone || '',
      city: row.city || '',
      address: row.address || '',
      birth_date: row.birth_date || '',
      gender: row.gender || 'other'
    };
    const patient = {
      patient_id: row.patient_id,
      user_id: row.user_id,
      therapist_id: row.therapist_id,
      status: row.patient_status,
      history_notes: row.history_notes
    };
    const personDepMap = depMap.get(row.person_id) || new Map();
    const selectedDepartments = Array.from(personDepMap.entries()).map(([department_id, group_ids]) => ({ department_id, group_ids }));
    return { person, patient, selectedDepartments };
  });
}

/**
 * שליפת כל הפגישות של מטופל
 */
export const getPatientDetails = async (patientId) => {
  const sql = `
    SELECT
      A.appointment_id,
      A.appointment_date,
      A.start_time,
      A.end_time,
      A.total_minutes,
      A.status,
      TT.group_name AS group_name,
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
    JOIN group_list AS TT ON A.type_id = TT.group_id
    JOIN Rooms AS R ON A.room_id = R.room_id
    WHERE A.patient_id = ? 
    ORDER BY A.appointment_date, A.start_time;
  `;
  const [rows] = await pool.query(sql, [patientId]);
  return rows;
};

/**
 * סטטיסטיקות פגישות של מטופל
 */
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


export const getAllPatients = async () => {
  const sql = `
    SELECT *
    FROM users u
    JOIN patients p ON u.user_id = p.user_id
    WHERE u.role = 'patient';
  `;
  const [rows] = await pool.query(sql);
  return rows; // מחזיר את כל המטופלים
}


/**
 * מחיקת מטופל לפי מזהה
 */
export async function deleteFromPatients(patientId) {
  return deleteFromTable('Patients', { patient_id: patientId });
}

/**
 * עדכון נתוני מטופל לפי מזהה
 */
export async function updateToPatients(patientId, updateData) {
  return updateTable('Patients', updateData, { patient_id: patientId });
}

/**
 * עדכון נתוני משתמש לפי מזהה
 */
export async function updateToUsers(userId, updateData) {
  return updateTable('Users', updateData, { user_id: userId });
}