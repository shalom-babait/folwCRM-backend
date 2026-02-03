
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../services/database.js';

import { findByUserName, promoteTempPasswordToPermanent, clearExpiredTempPassword } from '../users/user.repo.js';

export async function loginService(user_name, password) {
  const user = await findByUserName(user_name);
  if (!user) throw new Error('User not found');
  
  let isPasswordValid = false;
  let loginMessage = 'Login successful';

  // תרחיש 1: בדיקה אם יש סיסמה זמנית
  if (user.temp_password && user.temp_password_expires_at) {
    // השוואת זמנים: נשתמש ב-SQL כי זה יותר אמין
    const tempPasswordCheckQuery = `
      SELECT 
        CASE WHEN temp_password_expires_at > NOW() THEN 1 ELSE 0 END as is_valid
      FROM users 
      WHERE user_id = ?
    `;
    
    const [result] = await pool.query(tempPasswordCheckQuery, [user.user_id]);
    const isTempPasswordValid = result[0]?.is_valid === 1;
    
    // תרחיש A: הסיסמה הזמנית עדיין תקפה (תוך 5 דקות)
    if (isTempPasswordValid) {
      const isTempPasswordMatch = await bcrypt.compare(password, user.temp_password);
      
      if (isTempPasswordMatch && user.first_login_with_temp) {
        // כניסה ראשונה עם סיסמה זמנית - נעתיק אותה לקבועה!
        await promoteTempPasswordToPermanent(user.user_id, password);
        isPasswordValid = true;
        loginMessage = 'התחברת בהצלחה! הסיסמה עודכנה והפכה לקבועה';
        console.log(`User ${user_name} first login with temp password - promoted to permanent`);
      } else if (isTempPasswordMatch && !user.first_login_with_temp) {
        // זו לא כניסה ראשונה - הסיסמה כבר קבועה
        isPasswordValid = true;
        loginMessage = 'Login successful';
      }
    } else {
      // תרחיש B: הסיסמה הזמנית פגה תוקף (עברו 5 דקות)
      console.log(`Temp password expired for user ${user_name}, clearing...`);
      await clearExpiredTempPassword(user.user_id);
      // נמשיך לנסות עם הסיסמה הרגילה למטה
    }
  }
  
  // תרחיש 2: אם לא הצלחנו עם סיסמה זמנית, נסה עם הסיסמה הקבועה
  if (!isPasswordValid) {
    isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
  }

  const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  );
  const { password: userPassword, temp_password, temp_password_expires_at, first_login_with_temp, ...userWithoutPassword } = user;

  let therapist_id = null, patient_id = null, secretary_id = null;
  if (user.role === 'therapist') {
    const [rows] = await pool.query('SELECT therapist_id FROM therapists WHERE user_id = ?', [user.user_id]);
    therapist_id = rows[0]?.therapist_id || null;
    console.log('Therapist ID:', therapist_id);
  } else if (user.role === 'patient') {
    const [rows] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    patient_id = rows[0]?.patient_id || null;
    console.log('Patient ID:', patient_id);
  } else if (user.role === 'secretary') {
    secretary_id = user.user_id;
    console.log('Secretary ID:', secretary_id);
  }

  return {
    success: true,
    token,
    user: userWithoutPassword,
    therapist_id,
    patient_id,
    secretary_id,
    message: loginMessage
  };
}