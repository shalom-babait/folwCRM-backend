import { createAppointment, fetchAppointments, deleteAppointment, updateAppointment, fetchAppointmentsByRoom, fetchAppointmentsByGroupId, fetchAppointmentsByTherapist, getAppointmentsByPatientIdService } from "./appointments.service.js";

export async function getAppointmentsByGroupId(req, res) {

  try {
    const { groupId } = req.params;
    const organizationId = req.organization_id;
    const appointments = await fetchAppointmentsByGroupId(groupId, organizationId);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByGroupId] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by groupId" });
  }
}
// שליפת כל הפגישות של מטפל בלבד

export async function getAppointmentsByTherapist(req, res) {
  try {
    const { therapistId } = req.params;
    const organizationId = req.organization_id;
    const appointments = await fetchAppointmentsByTherapist(therapistId, organizationId);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByTherapist] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by therapist" });
  }
}
export async function getAppointmentsByRoom(req, res) {
  try {
    const { roomId } = req.params;
    const organizationId = req.organization_id;
    const appointments = await fetchAppointmentsByRoom(roomId, organizationId);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[getAppointmentsByRoom] Error:', err);
    res.status(500).json({ success: false, message: "Error fetching appointments by room" });
  }
}

export async function createAppointmentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const appointmentData = {
      ...req.body,
      organization_id: organizationId,
      room_id: req.body.room_id === undefined || req.body.room_id === 0 ? null : req.body.room_id,
      treatment_type_id: req.body.treatment_type_id === undefined || req.body.treatment_type_id === 0 ? null : req.body.treatment_type_id
    };
    // וולידציה בסיסית
    // room_id לא חובה, אפשר 0/null
    const requiredFields = [
      'therapist_id', 'patient_id',
      'appointment_date', 'start_time', 'end_time'
    ];
    for (const field of requiredFields) {
      if (!appointmentData[field] && appointmentData[field] !== 0) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    // וולידציה על סטטוס
    const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה'];
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
    console.error('[createAppointmentController] Error:', error);
    if (error.message && error.message.includes('Time conflict: Therapist')) {
      return res.status(409).json({
        success: false,
        message: 'המטפל אינו פנוי בשעה שבחרת. אנא בחר זמן אחר.'
      });
    }
    if (error.message && error.message.includes('Time conflict: Room')) {
      return res.status(409).json({
        success: false,
        message: 'החדר אינו פנוי בשעה שבחרת. אנא בחר זמן אחר.'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getAppointments(req, res) {
  try {
    const { patientId, therapistId } = req.params;
    const organizationId = req.organization_id;
    const appointments = await fetchAppointments(patientId, therapistId, organizationId);
    res.json(appointments);
  } catch (err) {
    console.error('[getAppointments] Error:', err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
}

export async function deleteAppointmentController(req, res) {
  try {
    const { appointmentId } = req.params;
    const organizationId = req.organization_id;
    // Validate appointmentId
    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }
    const result = await deleteAppointment(appointmentId, organizationId);
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
    const { appointmentId } = req.params;
    const organizationId = req.organization_id;
    // נרמול שדות אופציונליים
    const updateData = {
      ...req.body,
      room_id: req.body.room_id === undefined || req.body.room_id === 0 ? null : req.body.room_id,
      treatment_type_id: req.body.treatment_type_id === undefined || req.body.treatment_type_id === 0 ? null : req.body.treatment_type_id
    };
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
      const validStatuses = ['מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
    }
    const result = await updateAppointment(appointmentId, updateData, organizationId);
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
    const organizationId = req.organization_id;
    const rows = await getAppointmentsByPatientIdService(req.params.patientId, organizationId);   
    res.status(200).json(rows);
  } catch (err) {
    console.error('[getAppointmentsByPatientIdController] Error:', err);
    res.status(500).json({ error: err.message });
  }
}

