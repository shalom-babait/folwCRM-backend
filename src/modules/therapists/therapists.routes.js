import express from "express";
import { 
  createTherapistController, 
  getTherapistController,
  updateTherapistController,
  getTherapistIdByUserIdController
} from "./therapists.controller.js";

const router = express.Router();

// GET /therapists/byUser/:user_id - מחזיר therapist_id לפי user_id
router.get("/byUser/:user_id", getTherapistIdByUserIdController);

// POST /api/therapists - יצירת מטפל חדש
router.post("/create", createTherapistController);
router.get("/all", getTherapistController);

// PUT /api/therapists/updateTherapist/:therapistId - עדכון מטפל
router.put("/updateTherapist/:therapistId", updateTherapistController);

export default router;