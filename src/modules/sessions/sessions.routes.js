import express from "express";
import { updateSessionNotesController } from "./sessions.controller.js";

const router = express.Router();

router.put("/updateNotes", updateSessionNotesController);

export default router;