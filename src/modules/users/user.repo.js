import pool from "../../services/database.js";

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
  
  const query = `
    INSERT INTO Users (first_name, last_name, teudat_zehut, phone, city, address, email, password, role, agree)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      password,
      role || 'מטופל',
      agree || 0
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
      role: role || 'מטופל',
      agree: agree || 0,
      message: "User created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function findByEmail(email) {
  const query = "SELECT * FROM Users WHERE email = ?";
  
  try {
    const [rows] = await pool.execute(query, [email]);
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

// export async function createUser(name, email, hashedPassword) {
//   const [result] = await pool
//     // .promise()
//     .query('INSERT INTO Users (name, email, password) VALUES (?, ?, ?)', [
//       name,
//       email,
//       hashedPassword,
//     ]);
//   return result.insertId;
// }
// export async function createUser(name, email, hashedPassword) {
//   const [result] = await pool.query(
//     'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
//     [name, email, hashedPassword]
//   );
//   return result.insertId;
// }

// const findById = (id) => db('users').where({ id }).first();

// const findByEmail = (email) => db('users').where({ email }).first();

// module.exports = { createUser, findById, findByEmail };
