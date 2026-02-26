import {  getAppointmentsByGroupId, getAppointmentsByTherapist, create, checkTimeConflict, getAppointmentsByPatientAndTherapist, deleteFromAppointments, updateToAppointments, getAppointmentsByRoom, getAppointmentsByPatientId, updateAppointmentRepo } from "./appointments.repo.js";
import pool from "../../services/database.js";

export async function fetchAppointmentsByGroupId(groupId, organizationId = null) {
  return await getAppointmentsByGroupId(groupId, organizationId);
}

export async function fetchAppointmentsByTherapist(therapistId, organizationId = null) {

  return await getAppointmentsByTherapist(therapistId, organizationId);
}

export async function fetchAppointmentsByRoom(roomId, organizationId = null) {
  return await getAppointmentsByRoom(roomId, organizationId);
}

export async function createAppointment(appointmentData) {

  try {
    // בדיקה שהמטפל קיים
    const [therapist] = await pool.execute(
      "SELECT * FROM therapists WHERE therapist_id = ?",
      [appointmentData.therapist_id]
    );
    if (therapist.length === 0) {
      throw new Error("Therapist not found");
    }

    // בדיקה שהמטופל קיים
    const [patient] = await pool.execute(
      "SELECT * FROM patients WHERE patient_id = ?",
      [appointmentData.patient_id]
    );
    if (patient.length === 0) {
      throw new Error("Patient not found");
    }

    // בדיקה שקבוצת הטיפול קיימת (רק אם treatment_type_id לא ריק)
    if (appointmentData.treatment_type_id) {
      const [group] = await pool.execute(
        "SELECT * FROM group_list WHERE group_id = ?",
        [appointmentData.treatment_type_id]
      );
      if (group.length === 0) {
        throw new Error("Group not found");
      }
    }

    // בדיקה שהחדר קיים
    // בדיקה שהחדר קיים - רק אם נשלח room_id תקין (לא null/0)
    if (appointmentData.room_id && appointmentData.room_id !== 0) {
      const [room] = await pool.execute(
        "SELECT * FROM rooms WHERE room_id = ?",
        [appointmentData.room_id]
      );
      if (room.length === 0) {
        throw new Error("Room not found");
      }
    }

    // וולידציה על תאריכים וזמנים

    // בדיקה שזמן הסיום אחרי זמן ההתחלה
    if (appointmentData.start_time >= appointmentData.end_time) {
      throw new Error("End time must be after start time");
    }

    // בדיקת התנגשות למטפל
    const therapistConflict = await checkTimeConflict(
      appointmentData.therapist_id,
      null,
      appointmentData.appointment_date,
      appointmentData.start_time,
      appointmentData.end_time
    );
    // בדיקת התנגשות לחדר
    const roomConflict = appointmentData.room_id ? await checkTimeConflict(
      null,
      appointmentData.room_id,
      appointmentData.appointment_date,
      appointmentData.start_time,
      appointmentData.end_time
    ) : false;

    if (therapistConflict) {
      throw new Error("Time conflict: Therapist is not available at this time");
    }
    if (roomConflict) {
      throw new Error("Time conflict: Room is not available at this time");
    }

    const newAppointment = await create(appointmentData);
    return newAppointment;
  } catch (error) {
    throw error;
  }
}


export async function fetchAppointments(patientId, therapistId, organizationId = null) {
  return await getAppointmentsByPatientAndTherapist(patientId, therapistId, organizationId);
}

export async function deleteAppointment(appointmentId, organizationId = null) {
  try {
    // Check if appointment exists before deleting
    let sql = "SELECT * FROM appointments WHERE appointment_id = ?";
    const params = [appointmentId];

    if (organizationId) {
      sql += " AND organization_id = ?";
      params.push(organizationId);
    }

    const [appointment] = await pool.execute(sql, params);
    if (appointment.length === 0) {
      return false;
    }

    return await deleteFromAppointments(appointmentId, organizationId);
  } catch (error) {
    throw error;
  }
}

export async function updateAppointment(appointmentId, updateData, organizationId = null) {
  try {
    // Check if appointment exists
    let sql = "SELECT * FROM appointments WHERE appointment_id = ?";
    const params = [appointmentId];

    if (organizationId) {
      sql += " AND organization_id = ?";
      params.push(organizationId);
    }

    const [appointment] = await pool.execute(sql, params);
    if (appointment.length === 0) {
      return false;
    }

    // If updating time-related fields, check for conflicts
    if (updateData.start_time && updateData.end_time) {
      // נרמול room_id ל-null אם הוא 0 או undefined
      let roomId = updateData.room_id;
      if (roomId === undefined || roomId === 0) {
        roomId = null;
      }
      if (roomId === null && appointment[0].room_id) {
        roomId = appointment[0].room_id === 0 ? null : appointment[0].room_id;
      }
      const hasConflict = await checkTimeConflict(
        updateData.therapist_id || appointment[0].therapist_id,
        roomId,
        updateData.appointment_date || appointment[0].appointment_date,
        updateData.start_time,
        updateData.end_time,
        Number(appointmentId) // לא לכלול את הפגישה הנוכחית
      );

      if (hasConflict) {
        throw new Error("Time conflict: Therapist or room is not available at this time");
      }
    }

    // שימוש בפונקציה החדשה
    return await updateAppointmentRepo(Number(appointmentId), updateData, organizationId);
  } catch (error) {
    throw error;
  }
}

export async function getAppointmentsByPatientIdService(patient_id, organizationId = null) {
  return await getAppointmentsByPatientId(patient_id, organizationId);
}

export async function updateAppointmentNotes(appointmentId, notes) {
  return await updateToAppointments(appointmentId, { notes });
}
