import express from "express";
import * as patientController from "./patient.controller.js";

const router = express.Router();

// GET /patients/byTherapist/:therapistId
router.get("/byTherapist/:therapistId", patientController.getPatientsByTherapistController);

// GET /patients/:patientId
router.get("/:patientId", patientController.getPatientDetailsController);

// GET /patients/stats/:patientId
router.get("/stats/:patientId", patientController.getPatientStatsController);

export default router;
