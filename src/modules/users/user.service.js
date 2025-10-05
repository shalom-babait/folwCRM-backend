
import { create, findByEmail, findByTeudatZehut, findByPhone, updateToUsers, deleteFromUsers } from "./user.repo.js";
import pool from "../../services/database.js";

export async function createUser(userData) {
  try {
    // בדיקה שהאימייל לא קיים כבר
    const existingUserByEmail = await findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }

    // בדיקה שתעודת הזהות לא קיימת כבר (אם הוזנה)
    if (userData.teudat_zehut) {
      const existingUserByTZ = await findByTeudatZehut(userData.teudat_zehut);
      if (existingUserByTZ) {
        throw new Error("Teudat Zehut already exists");
      }

      // וולידציה על תעודת זהות (9 ספרות)
      if (!/^\d{9}$/.test(userData.teudat_zehut)) {
        throw new Error("Teudat Zehut must be exactly 9 digits");
      }
    }

    // בדיקה שמספר הטלפון לא קיים כבר
    const existingUserByPhone = await findByPhone(userData.phone);
    if (existingUserByPhone) {
      throw new Error("Phone number already exists");
    }

    // וולידציה על מספר טלפון (10 ספרות)
    if (!/^\d{10}$/.test(userData.phone)) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    // וולידציה על אימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error("Invalid email format");
    }

    // וולידציה על אורך שם פרטי
    if (userData.first_name.length > 15) {
      throw new Error("First name cannot exceed 15 characters");
    }

    // וולידציה על אורך שם משפחה
    if (userData.last_name.length > 20) {
      throw new Error("Last name cannot exceed 20 characters");
    }

    // וולידציה על אורך עיר
    if (userData.city.length > 15) {
      throw new Error("City name cannot exceed 15 characters");
    }

    // וולידציה על אורך כתובת
    if (userData.address && userData.address.length > 30) {
      throw new Error("Address cannot exceed 30 characters");
    }

    // וולידציה על אורך אימייל
    if (userData.email.length > 30) {
      throw new Error("Email cannot exceed 30 characters");
    }

    // וולידציה על אורך סיסמה
    if (userData.password.length > 15) {
      throw new Error("Password cannot exceed 15 characters");
    }

    const newUser = await create(userData);
    
    // החזרת הנתונים ללא הסיסמה
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;

  } catch (error) {
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    // חיפוש משתמש לפי אימייל
    const user = await findByEmail(email);
    
    if (!user) {
      throw new Error("User not found");
    }

    // בדיקת סיסמה
    // אם אתם משתמשים בהצפנה:
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // אם אתם לא משתמשים בהצפנה (לא מומלץ בסביבת פרודקשן):
    const isPasswordValid = password === user.password;
    
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // החזרת נתוני המשתמש ללא הסיסמה
    const { password: userPassword, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      message: "Login successful"
    };
    
  } catch (error) {
    throw error;
  }
}


export async function deleteUser(id) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM Users WHERE user_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await deleteFromUsers(id);
  } catch (error) {
    throw error;
  }
}

export async function updateUser(id, updateData) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM Users WHERE user_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }

    // Validate email format if it's being updated
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error("Invalid email format");
      }
    }

    // Validate phone number if it's being updated
    if (updateData.phone && !/^\d{10}$/.test(updateData.phone)) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    // Validate teudat_zehut if it's being updated
    if (updateData.teudat_zehut && !/^\d{9}$/.test(updateData.teudat_zehut)) {
      throw new Error("Teudat Zehut must be exactly 9 digits");
    }

    return await updateToUsers(id, updateData);
  } catch (error) {
    throw error;
  }
}
// import { createUser } from './user.repo.js';
// import bcrypt from 'bcrypt';

// export async function addUser(userData) {
//   const { name, email, password } = userData;

//   if (!name || !email || !password) {
//     throw new Error('All fields are required');
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const id = await createUser(name, email, hashedPassword);

//   return { id, name, email };
// }

// const repo = require('./user.repo');

// const create = async (payload) => {
//   const existing = await repo.findByEmail(payload.email);
//   if (existing) {
//     const err = new Error('Email already exists');
//     err.status = 409;
//     throw err;
//   }
//   const id = await repo.create(payload);
//   return repo.findById(id);
// };

// const getById = (id) => repo.findById(id);
