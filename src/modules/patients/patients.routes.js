import express from "express";
import { createPatientController ,getPatientsByTherapistController,getPatientDetailsController,getPatientStatsController} from "./patients.controller.js";

const router = express.Router();

// POST /api/patients - יצירת מטופל חדש
router.post("/", createPatientController);
// GET /patients/byTherapist/:therapistId
router.get("/byTherapist/:therapistId", getPatientsByTherapistController);

// GET /patients/:patientId
router.get("/:patientId", getPatientDetailsController);

// GET /patients/stats/:patientId
router.get("/stats/:patientId", getPatientStatsController);
export default router;