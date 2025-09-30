import { create, checkTimeConflict,getAppointmentsByPatientAndTherapist } from "./appointments.repo.js";
import pool from "../../services/database.js";

export async function createAppointment(appointmentData) {
  try {
    // בדיקה שהמטפל קיים
    const [therapist] = await pool.execute(
      "SELECT * FROM Therapists WHERE therapist_id = ?",
      [appointmentData.therapist_id]
    );
    if (therapist.length === 0) {
      throw new Error("Therapist not found");
    }

    // בדיקה שהמטופל קיים
    const [patient] = await pool.execute(
      "SELECT * FROM Patients WHERE patient_id = ?",
      [appointmentData.patient_id]
    );
    if (patient.length === 0) {
      throw new Error("Patient not found");
    }

    // בדיקה שסוג הטיפול קיים
    const [treatmentType] = await pool.execute(
      "SELECT * FROM TreatmentTypes WHERE type_id = ?",
      [appointmentData.type_id]
    );
    if (treatmentType.length === 0) {
      throw new Error("Treatment type not found");
    }

    // בדיקה שהחדר קיים
    const [room] = await pool.execute(
      "SELECT * FROM Rooms WHERE room_id = ?",
      [appointmentData.room_id]
    );
    if (room.length === 0) {
      throw new Error("Room not found");
    }

    // וולידציה על תאריכים וזמנים
    const appointmentDate = new Date(appointmentData.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      throw new Error("Appointment date cannot be in the past");
    }

    // בדיקה שזמן הסיום אחרי זמן ההתחלה
    if (appointmentData.start_time >= appointmentData.end_time) {
      throw new Error("End time must be after start time");
    }

    // בדיקת התנגשות זמנים
    const hasConflict = await checkTimeConflict(
      appointmentData.therapist_id,
      appointmentData.room_id,
      appointmentData.appointment_date,
      appointmentData.start_time,
      appointmentData.end_time
    );

    if (hasConflict) {
      throw new Error("Time conflict: Therapist or room is not available at this time");
    }

    const newAppointment = await create(appointmentData);
    return newAppointment;
  } catch (error) {
    throw error;
  }
}


export async function fetchAppointments(patientId, therapistId) {
  return await getAppointmentsByPatientAndTherapist(patientId, therapistId);
}