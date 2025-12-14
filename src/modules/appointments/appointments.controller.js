import { createAppointment, fetchAppointments, deleteAppointment, updateAppointment, fetchAppointmentsByRoom, fetchAppointmentsByGroupId, fetchAppointmentsByTherapist, getAppointmentsByPatientIdService } from "./appointments.service.js";

export async function getAppointmentsByGroupId(req, res) {

  try {
    console.log('[getAppointmentsByGroupId] req.params:', req.params);
    const { groupId } = req.params;
    const appointments = await fetchAppointmentsByGroupId(groupId);
    console.log('[getAppointmentsByGroupId] appointments:', appointments);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByGroupId] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by groupId" });
  }
}
// שליפת כל הפגישות של מטפל בלבד

export async function getAppointmentsByTherapist(req, res) {
  try {
    console.log('[getAppointmentsByTherapist] req.params:', req.params);
    const { therapistId } = req.params;
    const appointments = await fetchAppointmentsByTherapist(therapistId);
    if (!appointments || appointments.length === 0) {
      console.warn('[getAppointmentsByTherapist] No appointments found for therapistId:', therapistId);
    }
    console.log('[getAppointmentsByTherapist] appointments:', appointments);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByTherapist] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by therapist" });
  }
}
export async function getAppointmentsByRoom(req, res) {
  try {
    console.log('[getAppointmentsByRoom] req.params:', req.params);
    const { roomId } = req.params;
    const appointments = await fetchAppointmentsByRoom(roomId);
    console.log('[getAppointmentsByRoom] appointments:', appointments);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByRoom] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by room" });
  }
}

export async function createAppointmentController(req, res) {
  try {
    console.log('[createAppointmentController] req.body:', req.body);
    const appointmentData = req.body;

    // וולידציה בסיסית
    const requiredFields = [
      'therapist_id', 'patient_id', 'room_id',
      'appointment_date', 'start_time', 'end_time'
    ];

    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        console.warn(`[createAppointmentController] Missing required field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // וולידציה על סטטוס
    const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה'];
    if (appointmentData.status && !validStatuses.includes(appointmentData.status)) {
      console.warn('[createAppointmentController] Invalid status value:', appointmentData.status);
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // וולידציה על פורמט תאריך
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointmentData.appointment_date)) {
      console.warn('[createAppointmentController] Invalid date format:', appointmentData.appointment_date);
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // וולידציה על פורמט זמן
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(appointmentData.start_time) || !timeRegex.test(appointmentData.end_time)) {
      console.warn('[createAppointmentController] Invalid time format:', appointmentData.start_time, appointmentData.end_time);
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM or HH:MM:SS"
      });
    }

    const newAppointment = await createAppointment(appointmentData);
    console.log('[createAppointmentController] newAppointment:', newAppointment);
    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.error('[createAppointmentController] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getAppointments(req, res) {
  try {
    console.log('[getAppointments] req.params:', req.params);
    const { patientId, therapistId } = req.params;
    const appointments = await fetchAppointments(patientId, therapistId);
    console.log('[getAppointments] appointments:', appointments);
    res.json(appointments);
  } catch (err) {
    console.error('[getAppointments] Error:', err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
}

export async function deleteAppointmentController(req, res) {
  try {
    console.log('[deleteAppointmentController] req.params:', req.params);
    const { appointmentId } = req.params;

    // Validate appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
      console.warn('[deleteAppointmentController] Invalid appointment ID:', appointmentId);
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    const result = await deleteAppointment(appointmentId);
    console.log('[deleteAppointmentController] result:', result);

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
    console.error('[deleteAppointmentController] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting appointment"
    });
  }
}

export async function updateAppointmentController(req, res) {
  try {
    console.log('[updateAppointmentController] req.params:', req.params);
    console.log('[updateAppointmentController] req.body:', req.body);
    const { appointmentId } = req.params;
    const updateData = req.body;

    // Validate appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
      console.warn('[updateAppointmentController] Invalid appointment ID:', appointmentId);
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      console.warn('[updateAppointmentController] No update data provided');
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    // Validate date format if provided
    if (updateData.appointment_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.appointment_date)) {
        console.warn('[updateAppointmentController] Invalid date format:', updateData.appointment_date);
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD"
        });
      }
    }

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (updateData.start_time && !timeRegex.test(updateData.start_time)) {
      console.warn('[updateAppointmentController] Invalid start time format:', updateData.start_time);
      return res.status(400).json({
        success: false,
        message: "Invalid start time format. Use HH:MM or HH:MM:SS"
      });
    }
    if (updateData.end_time && !timeRegex.test(updateData.end_time)) {
      console.warn('[updateAppointmentController] Invalid end time format:', updateData.end_time);
      return res.status(400).json({
        success: false,
        message: "Invalid end time format. Use HH:MM or HH:MM:SS"
      });
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה'];
      if (!validStatuses.includes(updateData.status)) {
        console.warn('[updateAppointmentController] Invalid status value:', updateData.status);
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
    }

    const result = await updateAppointment(appointmentId, updateData);
    console.log('[updateAppointmentController] result:', result);

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
    console.error('[updateAppointmentController] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating appointment"
    });
  }
}


export async function getAppointmentsByPatientIdController(req, res) {
  try {
    console.log('[getAppointmentsByPatientIdController] req.params:', req.params);
    const rows = await getAppointmentsByPatientIdService(req.params.patientId);   
    console.log('[getAppointmentsByPatientIdController] rows:', rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error('[getAppointmentsByPatientIdController] Error:', err);
    res.status(500).json({ error: err.message });
  }
}

