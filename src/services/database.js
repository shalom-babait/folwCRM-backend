import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// נטען תמיד, גם בלוקאלי וגם ב-Railway
dotenv.config();

// יצירת Pool ל-MySQL
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,            // Host מסד הנתונים
  user: process.env.MYSQLUSER,            // שם המשתמש
  password: process.env.MYSQLPASSWORD,    // הסיסמה
  database: process.env.MYSQL_DATABASE,   // שם המסד
  port: process.env.MYSQLPORT || 3306,    // פורט, ברירת מחדל 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// בדיקת חיבור למסד
pool.getConnection()
  .then(conn => {
    console.log("Connected to MySQL!");
    conn.release();
  })
  .catch(err => {
    console.error("MySQL connection error:", err);
  });

// פונקציה למחיקה מטבלה עם תנאים
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

// פונקציה לעדכון רשומות בטבלה עם תנאים
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
