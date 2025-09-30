import { createAppointment,fetchAppointments } from "./appointments.service.js";

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