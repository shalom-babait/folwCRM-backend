import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'C:/sari programing/Shalom-Babait/shalombabait-backend/.env') });

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
