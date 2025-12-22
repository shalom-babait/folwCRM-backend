import pool, { deleteFromTable, updateTable } from "../../services/database.js";
import { createPerson } from "../person/person.repo.js";

/**
 * יצירת מטופל חדש: קודם פרסון, אחר כך פציינט, אחר כך שיוך מחלקות וקבוצות
 * מקבל אובייקט: { person, patient, selectedDepartments }
 */
export async function createPatient({ person, patient, selectedDepartments }) {

  const connection = await pool.getConnection();
  try {
    console.log('--- יצירת מטופל חדש ---');
    console.log('קלט מהפרונט:', JSON.stringify({ person, patient, selectedDepartments }, null, 2));
    await connection.beginTransaction();

    // 1. יצירת Person דרך הפונקציה הכללית (כולל טרנזקציה)
    const personResult = await createPerson(person, connection);
    // תומך גם במקרה ש-createPerson מחזיר אובייקט וגם מספר
    const person_id = typeof personResult === 'object' && personResult !== null && 'person_id' in personResult
      ? personResult.person_id
      : personResult;
    console.log('נוצר person_id:', person_id);

    // 2. יצירת פציינט
    const patientFields = [
      patient.user_id || null,
      patient.therapist_id || null,
      patient.status || 'פעיל',
      patient.history_notes || null,
      person_id
    ];
    console.log('patientFields:', patientFields);
    const [patientResult] = await connection.execute(
      `INSERT INTO patients (user_id, therapist_id, status, history_notes, person_id)
       VALUES (?, ?, ?, ?, ?)`,
      patientFields
    );
    const patient_id = patientResult.insertId;
    console.log('נוצר patient_id:', patient_id);

    // 3. שיוך מחלקות וקבוצות
    if (Array.isArray(selectedDepartments)) {
      for (const dep of selectedDepartments) {
        console.log('שיוך למחלקה:', dep.department_id);
        await connection.execute(
          `INSERT INTO userdepartments (person_id, department_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)`,
          [person_id, dep.department_id]
        );
        if (Array.isArray(dep.group_ids)) {
          for (const groupId of dep.group_ids) {
            console.log('שיוך לקבוצה:', groupId, 'במחלקה', dep.department_id);
            await connection.execute(
              `INSERT INTO user_groups (person_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = VALUES(group_id)`,
              [person_id, groupId]
            );
          }
        }
      }
    }

    await connection.commit();
    console.log('הוספת מטופל הסתיימה בהצלחה');
    // מבנה PatientCreationData
    return {
      person: {
        person_id,
        first_name: person.first_name,
        last_name: person.last_name,
        phone: person.phone || null,
        city: person.city || null,
        address: person.address || null,
        birth_date: person.birth_date || null,
        gender: person.gender || 'other',
        teudat_zehut: person.teudat_zehut || null,
        email: person.email || null
      },
      patient: {
        patient_id,
        user_id: patient.user_id || null,
        therapist_id: patient.therapist_id || null,
        status: patient.status || 'פעיל',
        history_notes: patient.history_notes || null
      },
      selectedDepartments: selectedDepartments || [],
      user: patient.user_id ? { user_id: patient.user_id } : null,
      message: "Patient created successfully"
    };
  } catch (error) {
    console.error('שגיאה בהוספת מטופל:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export async function getPatientFullData(patientId) {
  // שליפת נתוני משתמש ומטופל כולל JOIN ל-Person
  const sql = `
    SELECT P.patient_id, P.user_id, P.therapist_id, P.status AS patient_status, P.history_notes,
           P.person_id,
           PR.first_name, PR.last_name, PR.teudat_zehut, PR.phone, PR.city, PR.address, PR.birth_date, PR.gender,
           U.user_name, U.role, U.agree, U.created_at
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
    WHERE P.patient_id = ?
  `;
  const [rows] = await pool.query(sql, [patientId]);
  if (!rows.length) return null;
  const row = rows[0];

  // שליפת שיוך למחלקות וקבוצות
  const departmentsSql = `
    SELECT UD.department_id, GL.group_id
    FROM userdepartments UD
    LEFT JOIN user_groups UG ON UD.person_id = UG.person_id
    LEFT JOIN group_list GL ON UG.group_id = GL.group_id AND GL.department_id = UD.department_id
    WHERE UD.person_id = ?
  `;
  const [depRowsFull] = await pool.query(departmentsSql, [row.person_id]);

  // בניית מערך מחלקות וקבוצות
  const depMap = new Map();
  for (const drow of depRowsFull) {
    if (!drow.department_id) continue;
    if (!depMap.has(drow.department_id)) depMap.set(drow.department_id, []);
    if (drow.group_id) depMap.get(drow.department_id).push(drow.group_id);
  }
  const selectedDepartments = Array.from(depMap.entries()).map(([department_id, group_ids]) => ({ department_id, group_ids }));

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
    selectedDepartments: selectedDepartments || [],
    user: row.user_id ? {
      user_id: row.user_id,
      email: row.email,
      role: row.role,
      agree: row.agree,
      created_at: row.created_at
    } : null
  };
}


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
           U.user_name, U.role, U.agree, U.created_at
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
           U.user_name, U.role, U.agree, U.created_at
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
      A.notes,
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
    JOIN group_list AS TT ON A.treatment_type_id = TT.group_id
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
           U.user_name, U.role, U.agree, U.created_at
    FROM patients P
    LEFT JOIN users U ON P.user_id = U.user_id
    LEFT JOIN person PR ON P.person_id = PR.person_id
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

