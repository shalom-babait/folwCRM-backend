
import express from "express";
import {
  createPatientController,
  getPatientsByTherapistController,
  getPatientDetailsController,
  getPatientStatsController,
  deletePatientController,
  updatePatientController,
  getPatientOnlyController
} from "./patients.controller.js";

const router = express.Router();

// GET /patients/only/:patientId - מחזיר אובייקט מטופל בלבד

router.get("/only/:patientId", getPatientOnlyController);
router.post("/getAllPatients", getAllPatientsController);

// POST /api/patients - יצירת מטופל חדש
router.post("/", createPatientController);
// GET /patients/byTherapist/:therapistId
router.get("/byTherapist/:therapistId", getPatientsByTherapistController);

// GET /patients/:patientId
router.get("/:patientId", getPatientDetailsController);

// GET /patients/stats/:patientId
router.get("/stats/:patientId", getPatientStatsController);

// DELETE /api/patients/deletePatient/:patientId - מחיקת מטופל
router.delete("/deletePatient/:patientId", deletePatientController);

// PUT /api/patients/updatePatient/:patientId - עדכון מטופל
router.put("/updatePatient/:patientId", updatePatientController);

export default router;