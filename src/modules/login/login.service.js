
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../services/database.js'; // ודאי שיש ייבוא כזה

// ודא שיש לך פונקציה כזו ב-user.repo.js
import { findByUserName } from '../users/user.repo.js';

export async function loginService(user_name, password) {
  const user = await findByUserName(user_name);
  if (!user) throw new Error('User not found');
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid password');

  const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  );
  const { password: userPassword, ...userWithoutPassword } = user;

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
    message: 'Login successful'
  };
}