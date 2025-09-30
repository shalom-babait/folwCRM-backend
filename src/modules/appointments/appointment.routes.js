import { Router } from "express";
import { getAppointments } from "./appointment.controller.js";

const router = Router();

// דוגמה: GET /api/appointments/5/3
router.get("/:patientId/:therapistId", getAppointments);

export default router;
