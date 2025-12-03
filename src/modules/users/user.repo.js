import pool, { deleteFromTable, updateTable } from "../../services/database.js";
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
    `INSERT INTO Person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender || 'other']
  );
  const person_id = personResult.insertId;

  // יצירת User עם person_id
  const [userResult] = await pool.execute(
    `INSERT INTO Users (person_id, email, password, role, agree)
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

// מחזיר את כל פרטי המשתמש כולל פרטי person
export async function findByEmail(email) {
  const query = `
    SELECT u.*, p.*
    FROM Users u
    LEFT JOIN Person p ON u.person_id = p.person_id
    WHERE u.email = ?
  `;
  try {
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findByTeudatZehut(teudat_zehut) {
  const query = `
    SELECT u.*, p.*
    FROM Users u
    LEFT JOIN Person p ON u.person_id = p.person_id
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
    SELECT u.*, p.*
    FROM Users u
    LEFT JOIN Person p ON u.person_id = p.person_id
    WHERE p.phone = ?
  `;
  try {
    const [rows] = await pool.execute(query, [phone]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// ...existing code...
