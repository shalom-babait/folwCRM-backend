import * as patientService from './patient.service.js';

export async function getPatientsByTherapistController(req, res) {
  try {
    const { therapistId } = req.params;
    // השתמשי בפונקציה מתוך patientService
    const patients = await patientService.fetchPatientsByTherapist(therapistId);
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


export const getPatientDetailsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const details = await patientService.fetchPatientDetails(patientId);
    res.json(details);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient details' });
  }
};

export const getPatientStatsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const stats = await patientService.fetchPatientStats(patientId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient stats' });
  }
};