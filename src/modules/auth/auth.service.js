import jwt from 'jsonwebtoken';
import pool from '../../services/database.js';

/**
 * יצירת JWT Token למשתמש
 */
export function createAuthToken(userId, role) {
  const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
  return jwt.sign(
    { id: userId, role: role },
    SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * קבלת מזהים נוספים לפי תפקיד המשתמש
 */
export async function getUserRoleIds(userId, role) {
  let therapist_id = null;
  let patient_id = null;
  let secretary_id = null;

  if (role === 'therapist') {
    const [rows] = await pool.query('SELECT therapist_id FROM therapists WHERE user_id = ?', [userId]);
    therapist_id = rows[0]?.therapist_id || null;
  } else if (role === 'patient') {
    const [rows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [userId]);
    patient_id = rows[0]?.patient_id || null;
  } else if (role === 'secretary') {
    secretary_id = userId;
  }

  return { therapist_id, patient_id, secretary_id };
}

/**
 * הכנת אובייקט תגובה למשתמש
 */
export function prepareAuthResponse(user, token, roleIds) {
  // הסרת שדות רגישים
  const { password, temp_password, temp_password_expires_at, first_login_with_temp, ...userWithoutPassword } = user;

  const responseData = {
    success: true,
    token,
    user: userWithoutPassword,
    message: 'התחברות מוצלחת דרך Google'
  };

  // הוספת person data אם קיים
  if (user.person_id && user.first_name) {
    responseData.person = {
      person_id: user.person_id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      teudat_zehut: user.teudat_zehut,
      city: user.city,
      address: user.address,
      birth_date: user.birth_date,
      gender: user.gender
    };
  }

  // הוספת מזהים לפי תפקיד
  if (roleIds.therapist_id) responseData.therapist_id = roleIds.therapist_id;
  if (roleIds.patient_id) responseData.patient_id = roleIds.patient_id;
  if (roleIds.secretary_id) responseData.secretary_id = roleIds.secretary_id;

  return responseData;
}
