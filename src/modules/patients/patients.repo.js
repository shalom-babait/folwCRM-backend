/**
 * יצירת מטופל חדש: קודם פרסון, אחר כך פציינט, אחר כך שיוך מחלקות וקבוצות
 * מקבל אובייקט: { person, patient, selectedDepartments }
 */
export async function createPatient({ person, patient, selectedDepartments }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. יצירת Person
    const personFields = [
      person.first_name,
      person.last_name,
      person.teudat_zehut || null,
      person.phone || null,
      person.city || null,
      person.address || null,
      person.birth_date || null,
      person.gender || 'other'
    ];
    const [personResult] = await connection.execute(
      `INSERT INTO person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      personFields
    );
    const person_id = personResult.insertId;

    // 2. יצירת פציינט
    const patientFields = [
      patient.user_id || null,
      patient.therapist_id || null,
      patient.status || 'פעיל',
      patient.history_notes || null,
      person_id
    ];
    const [patientResult] = await connection.execute(
      `INSERT INTO patients (user_id, therapist_id, status, history_notes, person_id)
       VALUES (?, ?, ?, ?, ?)`,
      patientFields
    );
    const patient_id = patientResult.insertId;

    // 3. שיוך מחלקות וקבוצות
    if (Array.isArray(selectedDepartments)) {
      for (const dep of selectedDepartments) {
        await connection.execute(
          `INSERT INTO userdepartments (person_id, department_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)`,
          [person_id, dep.department_id]
        );
        if (Array.isArray(dep.group_ids)) {
          for (const groupId of dep.group_ids) {
            await connection.execute(
              `INSERT INTO user_groups (person_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = VALUES(group_id)`,
              [person_id, groupId]
            );
          }
        }
      }
    }

    await connection.commit();
    return {
      patient_id,
      person_id,
      ...person,
      ...patient,
      selectedDepartments: selectedDepartments || [],
      message: "Patient created successfully"
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function getPatientFullData(patientId) {
  // שליפת נתוני משתמש ומטופל כולל JOIN ל-Person
  const userPatientSql = `
    SELECT U.user_id, U.email, U.role, U.agree, U.created_at, U.person_id,
           P.patient_id, P.therapist_id, PR.birth_date AS patient_birth_date, P.gender AS patient_gender, P.status AS patient_status, P.history_notes,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender
    FROM users U
    JOIN patients P ON U.user_id = P.user_id
    LEFT JOIN person PR ON U.person_id = PR.person_id
    WHERE P.patient_id = ?
  `;
  const [fullRows] = await pool.query(userPatientSql, [patientId]);
  if (!fullRows.length) return null;
  const userRow = fullRows[0];

  // שליפת שיוך למחלקות וקבוצות
  const departmentsSql = `
    SELECT UD.department_id, GL.group_id
    FROM userdepartments UD
    LEFT JOIN user_groups UG ON UD.person_id = UG.person_id
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
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
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
  // בניית patient לפי המודל בפרונט
  const patient = {
    patient_id: userRow.patient_id,
    user_id: userRow.user_id,
    therapist_id: userRow.therapist_id ?? null,
    status: userRow.patient_status ?? '',
    history_notes: userRow.history_notes ?? '',
    person: person // פרטי המטופל האישיים
  };
  // החזרת אובייקט במבנה PatientCreationData
  return {
    person,
    patient,
    selectedDepartments: selectedDepartments || []
  };
}

import pool, { deleteFromTable, updateTable } from "../../services/database.js";

/**
  // שליפת נתוני מטופל ופרטי person בלבד
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender
    FROM patients P
    LEFT JOIN person PR ON P.person_id = PR.person_id
    WHERE P.patient_id = ?
  `;
  const [rows] = await pool.query(sql, [patientId]);
  if (!rows.length) return null;
  const row = rows[0];
  // בניית person
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
  // בניית patient לפי המודל בפרונט
  const patient = {
    patient_id: row.patient_id,
    user_id: row.user_id,
    therapist_id: row.therapist_id ?? null,
    status: row.patient_status ?? '',
    history_notes: row.history_notes ?? '',
    person: person // פרטי המטופל האישיים
  };
  // החזרת אובייקט במבנה PatientCreationData
  return {
    person,
    patient,
    selectedDepartments: []
  };
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.email, U.role, U.agree, U.created_at
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
    WHERE P.therapist_id = ?
  `;
  const [therapistRows] = await pool.query(sql, [therapistId]);
  if (!therapistRows.length) return [];

  // שליפת כל שיוכי מחלקות וקבוצות לכל המטופלים לפי person_id
  const personIds = therapistRows.map(row => row.person_id);
  if (personIds.length === 0) return [];
  const departmentsSql = `
    SELECT UD.person_id, UD.department_id, GL.group_id
    FROM userdepartments UD
    LEFT JOIN user_groups UG ON UD.person_id = UG.person_id
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
    const user = {
      user_id: row.user_id,
      email: row.email,
      role: row.role,
      agree: row.agree,
      created_at: row.created_at
    }
    const personDepMap = depMap.get(row.person_id) || new Map();
    const selectedDepartments = Array.from(personDepMap.entries()).map(([department_id, group_ids]) => ({ department_id, group_ids }));
    return { person, patient, user, selectedDepartments };
  });
}

/**
 * שליפת כל המטופלים לפי מזהה מטפל
 */
export const getPatientsByTherapist = async (therapistId) => {
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.email, U.role, U.agree, U.created_at
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
    WHERE P.therapist_id = ?
  `;
  const [rows] = await pool.query(sql, [therapistId]);
  if (!rows.length) return [];
  return rows.map(row => {
    return {
      user: {
        user_id: row.user_id,
        email: row.email,
        role: row.role,
        agree: row.agree,
        created_at: row.created_at
      },
      person: {
        person_id: row.person_id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        teudat_zehut: row.teudat_zehut || '',
        phone: row.phone || '',
        city: row.city || '',
        address: row.address || '',
        birth_date: row.birth_date || '',
        gender: row.gender || 'other'
      },
      patient: {
        patient_id: row.patient_id,
        user_id: row.user_id,
        therapist_id: row.therapist_id,
        status: row.patient_status,
        history_notes: row.history_notes
      }
    };
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
      PR.first_name AS patient_first_name,
      PR.last_name AS patient_last_name,
      PR.birth_date,
      P.gender,
      P.status AS patient_status
    FROM appointments AS A
    JOIN patients AS P ON A.patient_id = P.patient_id
    JOIN users AS U ON P.user_id = U.user_id
    JOIN group_list AS TT ON A.type_id = TT.group_id
    JOIN rooms AS R ON A.room_id = R.room_id
    join person AS PR ON U.person_id = PR.person_id
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
    FROM appointments
    WHERE patient_id = ?
  `;
  const [rows] = await pool.query(sql, [patientId]);
  return rows[0]; // מחזיר אובייקט אחד עם total_appointments ו-total_treatment_minutes
};


export const getAllPatients = async () => {
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.email, U.role, U.agree, U.created_at
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
    WHERE U.role = 'patient'
  `;
  const [rows] = await pool.query(sql);
  if (!rows.length) return [];

  return rows.map(row => {
    return {
      user: {
        user_id: row.user_id,
        email: row.email,
        role: row.role,
        agree: row.agree,
        created_at: row.created_at
      },
      person: {
        person_id: row.person_id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        teudat_zehut: row.teudat_zehut || '',
        phone: row.phone || '',
        city: row.city || '',
        address: row.address || '',
        birth_date: row.birth_date || '',
        gender: row.gender || 'other'
      },
      patient: {
        patient_id: row.patient_id,
        user_id: row.user_id,
        therapist_id: row.therapist_id,
        status: row.patient_status,
        history_notes: row.history_notes
      }
    };
  });
}


/**
 * מחיקת מטופל לפי מזהה
 */
export async function deleteFromPatients(patientId) {
  return deleteFromTable('patients', { patient_id: patientId });
}

/**
 * עדכון נתוני מטופל לפי מזהה
 */
export async function updateToPatients(patientId, updateData) {
  return updateTable('patients', updateData, { patient_id: patientId });
}

  /**
   * שליפת נתוני מטופל בלבד (ללא שיוך למחלקות/קבוצות)
   */
  export async function getPatientOnly(patientId) {
    const sql = `
      SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
             P.person_id,
             PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender
      FROM patients P
      LEFT JOIN person PR ON P.person_id = PR.person_id
      WHERE P.patient_id = ?
    `;
    const [rows] = await pool.query(sql, [patientId]);
    if (!rows.length) return null;
    const row = rows[0];
    // בניית person
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
    // בניית patient לפי המודל בפרונט
    const patient = {
      patient_id: row.patient_id,
      user_id: row.user_id,
      therapist_id: row.therapist_id ?? null,
      status: row.patient_status ?? '',
      history_notes: row.history_notes ?? '',
      person: person // פרטי המטופל האישיים
    };
    // החזרת אובייקט במבנה PatientCreationData
    return {
      person,
      patient,
      selectedDepartments: []
    };
  }

