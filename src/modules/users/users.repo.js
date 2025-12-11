import pool, { updateTable } from '../../services/database.js';

/**
 * יצירת משתמש חדש בטבלת Users
 */
export async function createUser(userData) {
  const { first_name, last_name, teudat_zehut, phone, city, address, email, password } = userData;
  // אם לא נשלח password, נשתמש בערך ברירת מחדל
  const userPassword = password || 'temp1234';
  const query = `
    INSERT INTO users (first_name, last_name, teudat_zehut, phone, city, address, email, password)
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

/**
 * עדכון נתוני משתמש לפי מזהה
 */
export async function updateToUsers(userId, updateData) {
  return updateTable('users', updateData, { user_id: userId });
}
import pool, { updateTable } from '../../services/database.js';

/**
 * יצירת משתמש חדש בטבלת Users
 */
export async function createUser(userData) {
  const { first_name, last_name, teudat_zehut, phone, city, address, email, password } = userData;
  // אם לא נשלח password, נשתמש בערך ברירת מחדל
  const userPassword = password || 'temp1234';
  const query = `
    INSERT INTO users (first_name, last_name, teudat_zehut, phone, city, address, email, password)
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

/**
 * עדכון נתוני משתמש לפי מזהה
 */
export async function updateToUsers(userId, updateData) {
  return updateTable('users', updateData, { user_id: userId });
}
