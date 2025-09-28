import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'C:/Users/User/Desktop/ShalomBabait/shalombabait-backend/.env') });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
});

console.log('USER:', process.env.MYSQL_USER);
console.log('PASSWORD:', process.env.MYSQL_PASSWORD);
console.log('DB:', process.env.MYSQL_DATABASE);

export default pool;
