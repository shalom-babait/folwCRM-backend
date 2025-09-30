import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'C:/Users/User/Desktop/ShalomBabait/shalombabait-backend/.env') });

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log("Connected to MySQL!");
    conn.release();
  })
  .catch(err => {
    console.error("MySQL connection error:", err);
  });

//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT || 3306,
// });

// console.log('USER:', process.env.MYSQL_USER);
// console.log('PASSWORD:', process.env.MYSQL_PASSWORD);
// console.log('DB:', process.env.MYSQL_DATABASE);


export default pool;
