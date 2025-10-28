import express from "express";
import { 
  createTherapistController, 
  getTherapistController,
  updateTherapistController
} from "./therapists.controller.js";

const router = express.Router();

// POST /api/therapists - יצירת מטפל חדש
router.post("/create", createTherapistController);
router.get("/all", getTherapistController);

// PUT /api/therapists/updateTherapist/:therapistId - עדכון מטפל
router.put("/updateTherapist/:therapistId", updateTherapistController);

export default router;