/**
 * מחזיר סכום שעות, סכום פגישות וסכום תשלומים למטפל עבור החודש הנוכחי
 * @param {number} therapistId
 * @returns {Promise<{total_hours: number, total_appointments: number, total_payments: number}>}
 */
export async function getTherapistMonthlyStats(therapistId) {
  // סכום שעות וסך פגישות
  const sqlAppointments = `
    SELECT
      IFNULL(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time))/60, 0) AS total_hours,
      COUNT(appointment_id) AS total_appointments
    FROM appointments
    WHERE therapist_id = ?
      AND MONTH(appointment_date) = MONTH(CURRENT_DATE())
      AND YEAR(appointment_date) = YEAR(CURRENT_DATE())
      AND status != 'בוטלה'
  `;
  const [appointmentsRows] = await pool.query(sqlAppointments, [therapistId]);

  // סכום תשלומים ישירות מטבלת payments לפי תאריך התשלום
  const sqlPayments = `
    SELECT IFNULL(SUM(amount), 0) AS total_payments
    FROM payments
    WHERE therapist_id = ?
      AND MONTH(payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(payment_date) = YEAR(CURRENT_DATE())
      AND status = 'paid'
  `;
  const [paymentsRows] = await pool.query(sqlPayments, [therapistId]);
  const total_payments = paymentsRows[0].total_payments;

  return {
    total_hours: appointmentsRows[0].total_hours,
    total_appointments: appointmentsRows[0].total_appointments,
    total_payments
  };
}
import pool, { deleteFromTable, updateTable } from "../../services/database.js";
import { create as createUser } from "../users/user.repo.js";
import { createPerson } from "../person/person.repo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// מחזיר therapist_id לפי user_id
export async function getTherapistIdByUserId(user_id) {
  const query = `SELECT therapist_id FROM therapists WHERE user_id = ? LIMIT 1`;
  const [rows] = await pool.execute(query, [user_id]);
  if (rows.length > 0) {
    return rows[0].therapist_id;
  }
  return null;
}
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
      INSERT INTO therapists (user_id)
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
  const query = `
    SELECT 
      t.therapist_id,
      t.user_id,
      u.user_name,
      u.role,
      u.agree,
      u.created_at,
      u.person_id,
      p.first_name,
      p.last_name,
      p.teudat_zehut,
      p.phone,
      p.city,
      p.address,
      p.birth_date,
      p.gender,
      p.email
    FROM therapists t
    INNER JOIN users u ON t.user_id = u.user_id
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE u.role = 'therapist'
    ORDER BY p.first_name, p.last_name
  `;
  const [rows] = await pool.execute(query);
  return rows.map(row => ({
    user: {
      user_id: row.user_id,
      person_id: row.person_id,
      user_name: row.user_name,
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
      gender: row.gender || 'other',
      email: row.email || ''
    },
    therapist: {
      therapist_id: row.therapist_id,
      specialization: '',
      experience_years: null
    },
    selectedDepartments: []
  }));
}
export async function deleteFromTherapists(therapistId) {
  return deleteFromTable('therapists', { therapist_id: therapistId });
}


export async function updateToTherapists(therapistId, updateData) {
  return updateTable('therapists', updateData, { therapist_id: therapistId });
}

export async function createTherapist({ user, person, therapist, selectedDepartments }) {
    // Normalize birth_date: if empty string, set to null
    if (!person.birth_date || person.birth_date.trim() === "") {
      person.birth_date = null;
    }
  const connection = await pool.getConnection();
  try {
    console.log('--- יצירת מטפל חדש ---');
    console.log('קלט מהפרונט:', JSON.stringify({ user, person, therapist, selectedDepartments }, null, 2));
    await connection.beginTransaction();

    // 1. יצירת User
    // שימוש בשם המשתמש מהפרונט (user_name)
    const token = jwt.sign({ user_name: user.user_name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userFields = [
      user.user_name, // שם משתמש עם קו תחתון
      token,
      user.role || 'therapist',
      user.agree || 0
    ];
    console.log('userFields:', userFields);
    const [userResult] = await connection.execute(
      `INSERT INTO users (user_name, password, role, agree) VALUES (?, ?, ?, ?)`,
      userFields
    );
    const user_id = userResult.insertId;
    console.log('נוצר user_id:', user_id);

    // 2. יצירת Person דרך הפונקציה הכללית (כולל טרנזקציה)
    const personResult = await createPerson(person, connection);
    const person_id = typeof personResult === 'object' && personResult !== null && 'person_id' in personResult
      ? personResult.person_id
      : personResult;
    console.log('נוצר person_id:', person_id);

    // 3. עדכון user עם person_id
    await connection.execute(
      `UPDATE users SET person_id = ? WHERE user_id = ?`,
      [person_id, user_id]
    );

    // 4. יצירת Therapist
    const therapistFields = [
      user_id,
      person_id
    ];
    console.log('therapistFields:', therapistFields);
    const [therapistResult] = await connection.execute(
      `INSERT INTO therapists (user_id, person_id) VALUES (?, ?)`,
      therapistFields
    );
    const therapist_id = therapistResult.insertId;
    console.log('נוצר therapist_id:', therapist_id);

    // 5. שיוך מחלקות וקבוצות
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
    console.log('הוספת מטפל הסתיימה בהצלחה');
    // מבנה TherapistCreationData
    return {
      user: {
        user_id,
        role: user.role || 'therapist',
        agree: user.agree || 0
      },
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
      therapist: {
        therapist_id,
        user_id,
        person_id
      },
      selectedDepartments: selectedDepartments || [],
      message: "Therapist created successfully"
    };
  } catch (error) {
    console.error('שגיאה בהוספת מטפל:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

