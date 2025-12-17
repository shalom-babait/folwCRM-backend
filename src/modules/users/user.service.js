import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { create, findByEmail, findByTeudatZehut, findByPhone, updateToUsers, deleteFromUsers } from "./user.repo.js";
import pool from "../../services/database.js";

export async function createUser(userData) {
  try {
    // בדיקה שהאימייל לא קיים כבר
    const existingUserByEmail = await findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error("Email already exists");
    }

    // וולידציה על אימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error("Invalid email format");
    }

    // וולידציה על אורך אימייל
    if (userData.email.length > 30) {
      throw new Error("Email cannot exceed 30 characters");
    }

    // וולידציה על אורך סיסמה
    if (userData.password.length > 15) {
      throw new Error("Password cannot exceed 15 characters");
    }
    userData.password = await bcrypt.hash(userData.password, 10);
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
    const user = await findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    // יצירת טוקן JWT
    const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );
    const { password: userPassword, ...userWithoutPassword } = user;
    return {
      token,
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
      "SELECT * FROM users WHERE user_id = ?",
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
      "SELECT * FROM users WHERE user_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }

    // הפרדת שדות אישיים לעדכון ב-Person
    const personFields = ['first_name', 'last_name', 'phone', 'teudat_zehut', 'city', 'address', 'birth_date', 'gender'];
    const userFields = ['email', 'password', 'role', 'agree'];

    const personUpdate = {};
    const userUpdate = {};
    for (const key in updateData) {
      if (personFields.includes(key)) personUpdate[key] = updateData[key];
      if (userFields.includes(key)) userUpdate[key] = updateData[key];
    }

    // עדכון טבלת Person
    let personUpdateResult = null;
    if (Object.keys(personUpdate).length > 0) {
      const person_id = existing[0].person_id;
      if (person_id) {
        // כאן יש לקרוא ל-updatePersonService או ל-updatePerson מהמודול המתאים
        // לדוגמה: personUpdateResult = await updatePersonService(person_id, personUpdate);
      }
    }

    // עדכון טבלת Users
    let userUpdateResult = null;
    if (Object.keys(userUpdate).length > 0) {
      // Validate email format if it's being updated
      if (userUpdate.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userUpdate.email)) {
          throw new Error("Invalid email format");
        }
      }
      userUpdateResult = await updateToUsers(id, userUpdate);
    }
    return { personUpdateResult, userUpdateResult };
  } catch (error) {
    throw error;
  }
}
