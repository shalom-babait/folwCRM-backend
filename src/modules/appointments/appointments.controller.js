// שליפת כל הפגישות של מטפל בלבד
import { fetchAppointmentsByTherapist } from "./appointments.service.js";

export async function getAppointmentsByTherapist(req, res) {
  try {
    const { therapistId } = req.params;
    console.log('getAppointmentsByTherapist - therapistId:', therapistId, typeof therapistId);
    const appointments = await fetchAppointmentsByTherapist(therapistId);
    console.log('getAppointmentsByTherapist - appointments:', appointments);
    if (!appointments || appointments.length === 0) {
      console.warn('No appointments found for therapistId:', therapistId);
    }
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching appointments by therapist" });
  }
}
import { createAppointment, fetchAppointments, deleteAppointment, updateAppointment, fetchAppointmentsByRoom } from "./appointments.service.js";
export async function getAppointmentsByRoom(req, res) {
  try {
    const { roomId } = req.params;
    const appointments = await fetchAppointmentsByRoom(roomId);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching appointments by room" });
  }
}

export async function createAppointmentController(req, res) {
  try {
    const appointmentData = req.body;
    
    // וולידציה בסיסית
    const requiredFields = [
      'therapist_id', 'patient_id', 'type_id', 'room_id', 
      'appointment_date', 'start_time', 'end_time'
    ];
    
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // וולידציה על סטטוס
    const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה'];
    if (appointmentData.status && !validStatuses.includes(appointmentData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // וולידציה על פורמט תאריך
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentData.appointment_date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // וולידציה על פורמט זמן
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(appointmentData.start_time) || !timeRegex.test(appointmentData.end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM or HH:MM:SS"
      });
    }

    const newAppointment = await createAppointment(appointmentData);
    
    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getAppointments(req, res) {
  try {
    const { patientId, therapistId } = req.params;
    const appointments = await fetchAppointments(patientId, therapistId);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
}

export async function deleteAppointmentController(req, res) {
  try {
    const { appointmentId } = req.params;
    
    // Validate appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    const result = await deleteAppointment(appointmentId);
    
    if (result) {
      res.json({
        success: true,
        message: "Appointment deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting appointment"
    });
  }
}

export async function updateAppointmentController(req, res) {
  try {
    const { appointmentId } = req.params;
    const updateData = req.body;
    
    // Validate appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    // Validate date format if provided
    if (updateData.appointment_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.appointment_date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    }

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (updateData.start_time && !timeRegex.test(updateData.start_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time format. Use HH:MM or HH:MM:SS"
      });
    }
    if (updateData.end_time && !timeRegex.test(updateData.end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid end time format. Use HH:MM or HH:MM:SS"
      });
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
    }

    const result = await updateAppointment(appointmentId, updateData);
    
    if (result) {
      res.json({
        success: true,
        message: "Appointment updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Appointment not found or no changes made"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating appointment"
    });
  }
}