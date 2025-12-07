import { createRoom, deleteRoom, fetchRooms, updateRoom } from "./rooms.service.js";

export async function getRoomsController(req, res) {
  try {
    console.log('Request body for getRoomsController:', req.body);
    const rooms = await fetchRooms();
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createRoomController(req, res) {
  try {
    console.log('Request body for createRoomController:', req.body);
    let roomData = req.body;
    // אם נשלח { room: { ... } } קח את הפנימי
    if (roomData.room && typeof roomData.room === 'object') {
      roomData = roomData.room;
    }
    const newRoom = await createRoom(roomData);
    res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function deleteRoomController(req, res) {
  try {
    console.log('Request body for deleteRoomController:', req.body);
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID"
      });
    }
    const result = await deleteRoom(id);
    if (result) {
      res.json({
        success: true,
        message: "Room deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting Room"
    });
  }
}

export async function updateRoomController(req, res) {
  try {
    console.log('Request body for updateRoomController:', req.body);
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID"
      });
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }
    
    const result = await updateRoom(id, updateData);
    if (result) {
      res.json({
        success: true,
        message: "Room updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Room not found or no changes made"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating Room"
    });
    console.log(error.message);
    
  }
}