import express from "express";
import { createAppointmentController, getAppointments } from "./appointments.controller.js";

const router = express.Router();

// POST /api/appointments - יצירת תור חדש
router.post("/", createAppointmentController);
router.get("/:patientId/:therapistId", getAppointments);

export default router;