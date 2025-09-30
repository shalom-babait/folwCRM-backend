import { createRoom, fetchRooms } from "./rooms.service.js";

export async function getRoomsController(req, res) {
    try {
        const rooms = await fetchRooms();
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function createRoomController(req, res) {
    try {
        const newRoom = await createRoom(req.body);

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