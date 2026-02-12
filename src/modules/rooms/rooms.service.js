import { create, deleteFromRooms, getRooms, updateToRooms,fetchRoomAvailability, upsertRoomAvailability} from "./rooms.repo.js";
import pool from "../../services/database.js";

export const fetchRooms = async (organizationId = null) => {
    try {
        const therapists = await getRooms(organizationId);
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

export async function deleteRoom(id, organizationId = null) {
  try {
    let sql = "SELECT * FROM rooms WHERE room_id = ?";
    const params = [id];
    
    if (organizationId) {
      sql += " AND organization_id = ?";
      params.push(organizationId);
    }
    
    const [existing] = await pool.execute(sql, params);
    if (existing.length === 0) {
      return false;
    }
    return await deleteFromRooms(id, organizationId);
  } catch (error) {
    throw error;
  }
}

export async function updateRoom(id, updateData, organizationId = null) {
  try {
    let sql = "SELECT * FROM rooms WHERE room_id = ?";
    const params = [id];
    
    if (organizationId) {
      sql += " AND organization_id = ?";
      params.push(organizationId);
    }
    
    const [existing] = await pool.execute(sql, params);
    if (existing.length === 0) {
      return false;
    }
    return await updateToRooms(id, updateData, organizationId);
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