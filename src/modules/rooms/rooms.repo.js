import pool from "../../services/database.js";

export async function getRooms() {
  try {
    const query = `
        SELECT * FROM Rooms
      `;

    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
} 

export async function create(roomData) {
  const { room_name } = roomData;

  const query = `
    INSERT INTO Rooms (room_name)
    VALUES (?)
  `;

  try {
    const [result] = await pool.execute(query, [room_name]);
    return {
      room_id: result.insertId,
      room_name,
      message: "Room created successfully"
    };
  } catch (error) {
    throw error;
  }
}
