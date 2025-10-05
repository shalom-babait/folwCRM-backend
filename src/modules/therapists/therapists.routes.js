import express from "express";
import { 
  createTherapistController, 
  getTherapidtController,
  deleteTherapistController,
  updateTherapistController
} from "./therapists.controller.js";

const router = express.Router();

// POST /api/therapists - יצירת מטפל חדש
router.post("/", createTherapistController);
router.get("/", getTherapidtController);

// DELETE /api/therapists/deleteTherapist/:therapistId - מחיקת מטפל
router.delete("/deleteTherapist/:therapistId", deleteTherapistController);

// PUT /api/therapists/updateTherapist/:therapistId - עדכון מטפל
router.put("/updateTherapist/:therapistId", updateTherapistController);

export default router;