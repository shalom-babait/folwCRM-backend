import express from "express";
import {
  createPatientController,
  getPatientsByTherapistController,
  getPatientDetailsController,
  getPatientStatsController,
  updatePatientController,
  getPatientOnlyController,
  getAllPatientsController,
  deletePatientFullController
} from "./patients.controller.js";

const router = express.Router();

// GET /patients/only/:patientId - מחזיר אובייקט מטופל בלבד

router.get("/only/:patientId", getPatientOnlyController);

router.get("/getAllPatients", getAllPatientsController);

// POST /api/patients - יצירת מטופל חדש
router.post("/create", createPatientController);
// GET /patients/byTherapist/:therapistId
router.get("/byTherapist/:therapistId", getPatientsByTherapistController);

// GET /patients/:patientId
router.get("/:patientId", getPatientDetailsController);

// GET /patients/stats/:patientId
router.get("/stats/:patientId", getPatientStatsController);

// DELETE /api/patients/deleteFull/:patientId - מחיקת מטופל מכל הטבלאות
router.delete('/deleteFull/:patientId', deletePatientFullController);

// PUT /api/patients/updatePatient/:patientId - עדכון מטופל
router.put("/updatePatient/:patientId", updatePatientController);

export default router;