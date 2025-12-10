import pool, { deleteFromTable, updateTable } from "../../services/database.js";

export async function getRooms() {
  try {
    const rooms_sql = `
        SELECT room_id, room_name, color FROM rooms
      `;
    const [rows] = await pool.execute(rooms_sql);
    return rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
} 

export async function create(roomData) {
  const { room_name, color } = roomData;

  const rooms_query = `
    INSERT INTO rooms (room_name, color)
    VALUES (?, ?)
  `;

  try {
    const [result] = await pool.execute(rooms_query, [room_name, color || null]);
    return {
      room_id: result.insertId,
      room_name,
      color: color || null,
      message: "Room created successfully"
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteFromRooms(roomId) {
  return deleteFromTable('rooms', { room_id: roomId });
}

export async function updateToRooms(roomId, updateData) {
  return updateTable('rooms', updateData, { room_id: roomId });
}