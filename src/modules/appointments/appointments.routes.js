import express from "express";
import { 
  createAppointmentController, 
  getAppointments,
  deleteAppointmentController,
  updateAppointmentController,
  getAppointmentsByRoom
} from "./appointments.controller.js";

const router = express.Router();

// POST /api/appointments - יצירת תור חדש
router.post("/", createAppointmentController);

router.get("/byRoom/:roomId", getAppointmentsByRoom);

router.get("/:patientId/:therapistId", getAppointments);

// DELETE /api/appointments/deleteAppointment/:appointmentId - מחיקת תור
router.delete("/deleteAppointment/:appointmentId", deleteAppointmentController);

// PUT /api/appointments/updateAppointment/:appointmentId - עדכון תור
router.put("/updateAppointment/:appointmentId", updateAppointmentController);

export default router;