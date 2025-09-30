import express from "express";
import { createTherapistController, getTherapidtController } from "./therapists.controller.js";

const router = express.Router();

// POST /api/therapists - יצירת מטפל חדש
router.post("/", createTherapistController);
router.get("/",getTherapidtController)
export default router;