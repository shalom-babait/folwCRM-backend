import pool, { deleteFromTable, updateTable } from "../../services/database.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function create(userData) {
  const {
    first_name,
    last_name,
    teudat_zehut,
    phone,
    city,
    address,
    email,
    password,
    role,
    agree
  } = userData;

  // הצפנת הסיסמה
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO Users (first_name, last_name, teudat_zehut, phone, city, address, email, password, role, agree, gender, birth_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.execute(query, [
      first_name,
      last_name,
      teudat_zehut || null,
      phone,
      city,
      address || null,
      email,
      hashedPassword,
      role || 'patient',
      agree || 0,
      userData.gender,
      userData.birth_date || null
    ]);

    // יצירת טוקן JWT
    const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
    const token = jwt.sign(
  { id: result.insertId, role: role || 'patient' },
      SECRET,
      { expiresIn: '1h' }
    );

    return {
      user_id: result.insertId,
      first_name,
      last_name,
      teudat_zehut,
      phone,
      city,
      address,
      email,
      role: role || 'patient',
      agree: agree || 0,
      gender: userData.gender,
      birth_date: userData.birth_date || null,
      token,
      message: "User created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function findByEmail(email) {
    console.log("findByEmail:", email);
    const query = "SELECT * FROM Users WHERE email = ?";
    // הדפסת השאילתא המלאה כפי שתישלח ל-DB
    console.log(`Full SQL: SELECT * FROM Users WHERE email = '${email}'`);
    console.log("findByEmail called with email:", query);
  try {
    const [rows] = await pool.execute(query, [email]);
    console.log("DB returned rows:", rows);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findByTeudatZehut(teudat_zehut) {
  const query = "SELECT * FROM Users WHERE teudat_zehut = ?";
  
  try {
    const [rows] = await pool.execute(query, [teudat_zehut]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findByPhone(phone) {
  const query = "SELECT * FROM Users WHERE phone = ?";
  
  try {
    const [rows] = await pool.execute(query, [phone]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// const findByEmail = (email) => db('users').where({ email }).first();

export async function deleteFromUsers(userId) {
  return deleteFromTable('Users', { user_id: userId });
}

export async function updateToUsers(userId, updateData) {
  return updateTable('Users', updateData, { user_id: userId });
}
