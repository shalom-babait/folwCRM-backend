import { fetchAppointments } from "./appointment.service.js";

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
