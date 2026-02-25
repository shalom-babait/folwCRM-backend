import { updateSessionNotes } from "./sessions.service.js";

export async function updateSessionNotesController(req, res) {
  try {
    const { appointmentId, notes } = req.body;

    if (!appointmentId || isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointmentId"
      });
    }

    const updated = await updateSessionNotes(appointmentId, notes);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    res.json({
      success: true,
      message: "Notes updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
}