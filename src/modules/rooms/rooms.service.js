import { create, deleteFromRooms, getRooms, updateToRooms,fetchRoomAvailability, upsertRoomAvailability} from "./rooms.repo.js";
import pool from "../../services/database.js";

export const fetchRooms = async () => {
    try {
        const therapists = await getRooms();
        return therapists;
    } catch (error) {
        throw error;
    }

};

export async function createRoom(roomData) {
    try {
        const newRoom = await create(roomData);
        return newRoom;
    } catch (error) {
        throw error;
    }
}

export async function deleteRoom(id) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM rooms WHERE room_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await deleteFromRooms(id);
  } catch (error) {
    throw error;
  }
}

export async function updateRoom(id, updateData) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM rooms WHERE room_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await updateToRooms(id, updateData);
  } catch (error) {
    throw error;
  }
}
export async function saveRoomAvailability(roomId, availabilityArr) {
  try {
    return await upsertRoomAvailability(roomId, availabilityArr);
  } catch (error) {
    throw error;
  }
}

export async function getRoomAvailability(roomId) {
  try {
    return await fetchRoomAvailability(roomId);
  } catch (error) {
    throw error;
  }
}