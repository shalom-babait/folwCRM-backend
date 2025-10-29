import { findByEmail } from '../users/user.repo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function loginService(email, password) {
  console.log("Attempting to find user by email:", email);
  console.log("Password received:", password);
  const user = await findByEmail(email);
  console.log("User found in loginService:", user);
  if (!user) throw new Error('User not found');
  console.log(bcrypt.compare(password, user.password));
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log("Is password valid:", isPasswordValid, password);
  if (!isPasswordValid) throw new Error('Invalid password');

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
    message: 'Login successful'
  };
}