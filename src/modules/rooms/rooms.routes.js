import express from "express";
import { createRoomController, deleteRoomController, getRoomsController, updateRoomController, getRoomAvailabilityController, saveRoomAvailabilityController} from "./rooms.controller.js";

const router = express.Router();

router.post("/addRoom",createRoomController)
router.delete("/deleteRoom/:id", deleteRoomController);
router.put("/updateRoom/:id", updateRoomController);
router.get("/getRooms",getRoomsController)

router.get("/availability/:roomId", getRoomAvailabilityController);
router.post("/availability/:roomId", saveRoomAvailabilityController);
export default router;