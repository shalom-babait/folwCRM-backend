import express from "express";
import {
  createAppointmentController,
  getAppointments,
  deleteAppointmentController,
  updateAppointmentController,
  getAppointmentsByRoom,
  getAppointmentsByTherapist,
  getAppointmentsByGroupId
} from "./appointments.controller.js";
const router = express.Router();

// שליפת כל הפגישות של קבוצה מסוימת
router.get("/group/:groupId", getAppointmentsByGroupId);

// POST /api/appointments - יצירת תור חדש
router.post("/", createAppointmentController);

router.get("/byRoom/:roomId", getAppointmentsByRoom);

// שליפת כל הפגישות של מטפל בלבד
router.get("/therapist/:therapistId", getAppointmentsByTherapist);

router.get("/:patientId/:therapistId", getAppointments);

// DELETE /api/appointments/deleteAppointment/:appointmentId - מחיקת תור
router.delete("/deleteAppointment/:appointmentId", deleteAppointmentController);

// PUT /api/appointments/updateAppointment/:appointmentId - עדכון תור
router.put("/updateAppointment/:appointmentId", updateAppointmentController);
router.put("/:appointmentId/status", updateAppointmentController);

export default router;