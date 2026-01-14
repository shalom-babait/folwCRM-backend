import express from "express";
import {
  createAppointmentController,
  getAppointments,
  deleteAppointmentController,
  updateAppointmentController,
  getAppointmentsByRoom,
  getAppointmentsByTherapist,
  getAppointmentsByGroupId,
  getAppointmentsByPatientIdController
} from "./appointments.controller.js";
const router = express.Router();

// שליפת כל הפגישות של מטפל בלבד
router.get("/therapist/:therapistId", getAppointmentsByTherapist);

// שליפת כל הפגישות של מטפל ומטופל מסוימים יחד
router.get("/byPatientAndTherapist/:patientId/:therapistId", getAppointments);
router.get("/group/:groupId", getAppointmentsByGroupId);

router.get("/patient/:patientId", getAppointmentsByPatientIdController);
// POST /api/appointments - יצירת תור חדש
router.post("/", createAppointmentController);

router.get("/byRoom/:roomId", getAppointmentsByRoom);

// שליפת כל הפגישות של מטפל בלבד
router.get("/therapist/:therapistId", getAppointmentsByTherapist);

// שליפת כל הפגישות של מטפל ומטופל מסוימים יחד

// DELETE /api/appointments/deleteAppointment/:appointmentId - מחיקת תור
router.delete("/deleteAppointment/:appointmentId", deleteAppointmentController);

// PUT /api/appointments/updateAppointment/:appointmentId - עדכון תור
router.put("/updateAppointment/:appointmentId", updateAppointmentController);
router.put("/:appointmentId/status", updateAppointmentController);


export default router;