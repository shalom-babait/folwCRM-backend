import { getAppointmentsByGroupId, getAppointmentsByTherapist, create, checkTimeConflict, getAppointmentsByPatientAndTherapist, deleteFromAppointments, updateToAppointments, getAppointmentsByRoom } from "./appointments.repo.js";
import pool from "../../services/database.js";

export async function fetchAppointmentsByGroupId(groupId) {
  return await getAppointmentsByGroupId(groupId);
}

export async function fetchAppointmentsByTherapist(therapistId) {  

  return await getAppointmentsByTherapist(therapistId);
}

export async function fetchAppointmentsByRoom(roomId) {
  return await getAppointmentsByRoom(roomId);
}

export async function createAppointment(appointmentData) {
  console.log({ appointmentData });

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
    console.log(appointmentData.type_id);

    // בדיקה שקבוצת הטיפול קיימת (ולא בודקים ב-TreatmentTypes)
    const [group] = await pool.execute(
      "SELECT * FROM group_list WHERE group_id = ?",
      [appointmentData.type_id]
    );
    if (group.length === 0) {
      throw new Error("Group not found");
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

export async function deleteAppointment(appointmentId) {
  try {
    // Check if appointment exists before deleting
    const [appointment] = await pool.execute(
      "SELECT * FROM Appointments WHERE appointment_id = ?",
      [appointmentId]
    );
    if (appointment.length === 0) {
      return false;
    }

    return await deleteFromAppointments(appointmentId);
  } catch (error) {
    throw error;
  }
}

export async function updateAppointment(appointmentId, updateData) {
  try {
    // Check if appointment exists
    const [appointment] = await pool.execute(
      "SELECT * FROM Appointments WHERE appointment_id = ?",
      [appointmentId]
    );
    if (appointment.length === 0) {
      return false;
    }

    // If updating time-related fields, check for conflicts
    if (updateData.start_time && updateData.end_time) {
      const hasConflict = await checkTimeConflict(
        updateData.therapist_id || appointment[0].therapist_id,
        updateData.room_id || appointment[0].room_id,
        updateData.appointment_date || appointment[0].appointment_date,
        updateData.start_time,
        updateData.end_time
      );

      if (hasConflict) {
        throw new Error("Time conflict: Therapist or room is not available at this time");
      }
    }

    return await updateToAppointments(appointmentId, updateData);
  } catch (error) {
    throw error;
  }
}