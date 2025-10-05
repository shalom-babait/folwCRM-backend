import express from "express";
import { createRoomController, deleteRoomController, getRoomsController, updateRoomController } from "./rooms.controller.js";

const router = express.Router();

router.get("/getRooms",getRoomsController)
router.post("/",createRoomController)
router.delete("/deleteRoom/:id", deleteRoomController);
router.put("/updateRoom/:id", updateRoomController);
export default router;