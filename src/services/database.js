import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// נטען רק עבור סביבת פיתוח (לוקאלי)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

// יצירת Pool ל-MySQLI
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,   
  user: process.env.MYSQLUSER,       
  password: process.env.MYSQLPASSWORD, 
  database: process.env.MYSQLDATABASE, 
  port: process.env.MYSQLPORT || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Connecting to MySQL host:', process.env.MYSQLHOST);
pool.getConnection()
  .then(conn => {
    console.log("Connected to MySQL!");
    conn.release();
  })
  .catch(err => {
    console.error("MySQL connection error:", err);
  });

export const deleteFromTable = async (tableName, conditions) => {
  try {
    const columns = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = columns.map(col => `${col} = ?`).join(' AND ');
    const [result] = await pool.execute(`DELETE FROM ${tableName} WHERE ${whereClause}`, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    throw error;
  }
};

export const updateTable = async (tableName, updates, conditions) => {
  try {
    const updateColumns = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateColumns.map(col => `${col} = ?`).join(', ');

    const whereColumns = Object.keys(conditions);
    const whereValues = Object.values(conditions);
    const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ');

    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    const values = [...updateValues, ...whereValues];

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    throw error;
  }
};

export default pool;
