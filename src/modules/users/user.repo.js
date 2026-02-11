import pool, { deleteFromTable, updateTable } from "../../services/database.js";
/**
 * עדכון נתוני משתמש לפי מזהה
 */
export async function updateToUsers(userId, updateData) {
  return updateTable('users', updateData, { user_id: userId });
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// יצירת משתמש חדש: קודם יוצר Person, אחר כך User
export async function create(userData) {
  const {
    first_name,
    last_name,
    teudat_zehut,
    phone,
    city,
    address,
    birth_date,
    gender,
    email,
    password,
    role,
    agree
  } = userData;

  // הצפנת הסיסמה
  const hashedPassword = await bcrypt.hash(password, 10);

  // יצירת Person
  const [personResult] = await pool.execute(
    `INSERT INTO person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender || 'other']
  );
  const person_id = personResult.insertId;

  // יצירת User עם person_id
  const [userResult] = await pool.execute(
    `INSERT INTO users (person_id, email, password, role, agree)
     VALUES (?, ?, ?, ?, ?)`,
    [person_id, email, hashedPassword, role || 'patient', agree || 0]
  );

  // יצירת טוקן JWT
  const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
  const token = jwt.sign(
    { id: userResult.insertId, role: role || 'patient' },
    SECRET,
    { expiresIn: '1h' }
  );

  return {
    user_id: userResult.insertId,
    person_id,
    email,
    role: role || 'patient',
    agree: agree || 0,
    token,
    message: "User created successfully"
  };
}

// מחזיר את כל פרטי המשתמש לפי user_name כולל פרטי person
export async function findByUserName(user_name) {
  const query = `
    SELECT u.user_id, u.organization_id, u.user_name, u.password, u.created_at, 
           u.agree, u.role, u.person_id, u.google_id, u.auth_provider,
           u.temp_password, u.temp_password_expires_at, u.first_login_with_temp,
           p.first_name, p.last_name, p.teudat_zehut, p.phone, p.city, 
           p.address, p.birth_date, p.gender, p.email, p.mother_name
    FROM users u
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE u.user_name = ?
  `;
  try {
    const [rows] = await pool.execute(query, [user_name]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findByTeudatZehut(teudat_zehut) {
  const query = `
    SELECT u.user_id, u.organization_id, u.user_name, u.password, u.created_at, 
           u.agree, u.role, u.person_id, u.google_id, u.auth_provider,
           u.temp_password, u.temp_password_expires_at, u.first_login_with_temp,
           p.first_name, p.last_name, p.teudat_zehut, p.phone, p.city, 
           p.address, p.birth_date, p.gender, p.email, p.mother_name
    FROM users u
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE p.teudat_zehut = ?
  `;
  try {
    const [rows] = await pool.execute(query, [teudat_zehut]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findByPhone(phone) {
  const query = `
    SELECT u.user_id, u.organization_id, u.user_name, u.password, u.created_at, 
           u.agree, u.role, u.person_id, u.google_id, u.auth_provider,
           u.temp_password, u.temp_password_expires_at, u.first_login_with_temp,
           p.first_name, p.last_name, p.teudat_zehut, p.phone, p.city, 
           p.address, p.birth_date, p.gender, p.email, p.mother_name
    FROM users u
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE p.phone = ?
  `;
  try {
    const [rows] = await pool.execute(query, [phone]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// מחזיר את כל פרטי המשתמש לפי email כולל פרטי person
export async function findByEmail(email) {
  const query = `
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN person p ON u.person_id = p.person_id
    WHERE p.email = ?
  `;
  try {
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// עדכון סיסמה של משתמש
export async function updatePassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return updateTable('users', { password: hashedPassword }, { user_id: userId });
}

// שמירת סיסמה זמנית עם תוקף של 5 דקות
export async function setTempPassword(userId, tempPassword) {
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  
  // שימוש ב-SQL לחישוב זמן התפוגה (DATE_ADD עובד עם timezone של MySQL)
  const query = `
    UPDATE users 
    SET temp_password = ?,
        temp_password_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
        first_login_with_temp = TRUE
    WHERE user_id = ?
  `;
  
  try {
    const [result] = await pool.execute(query, [hashedPassword, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error setting temp password:', error);
    throw error;
  }
}

// מעתיק סיסמה זמנית לסיסמה קבועה ומנקה את השדות הזמניים
export async function promoteTempPasswordToPermanent(userId, tempPassword) {
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  return updateTable('users', { 
    password: hashedPassword,
    temp_password: null,
    temp_password_expires_at: null,
    first_login_with_temp: false
  }, { user_id: userId });
}

// מחיקת סיסמה זמנית שפג תוקפה
export async function clearExpiredTempPassword(userId) {
  return updateTable('users', { 
    temp_password: null,
    temp_password_expires_at: null,
    first_login_with_temp: false
  }, { user_id: userId });
}

