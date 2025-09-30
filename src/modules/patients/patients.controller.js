// import { createPatient, fetchPatientDetails,fetchPatientStats} from "./patients.service.js";
import { createPatient, fetchPatientsByTherapist, fetchPatientDetails,fetchPatientStats} from "./patients.service.js";
export async function createPatientController(req, res) {
  try {
    const patientData = req.body;
    
    // וולידציה בסיסית
    if (!patientData.user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required"
      });
    }

    // וולידציה על gender
    const validGenders = ['זכר', 'נקבה', 'אחר'];
    if (patientData.gender && !validGenders.includes(patientData.gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender value"
      });
    }

    // וולידציה על status
    const validStatuses = ['פעיל', 'לא פעיל', 'בהמתנה'];
    if (patientData.status && !validStatuses.includes(patientData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const newPatient = await createPatient(patientData);
    
    res.status(201).json({
      success: true,
      data: newPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


export async function getPatientsByTherapistController(req, res) {
  try {
    const { therapistId } = req.params;
    // השתמשי בפונקציה מתוך patientService
    const patients = await fetchPatientsByTherapist(therapistId);
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


export const getPatientDetailsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const details = await fetchPatientDetails(patientId);
    res.json(details);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient details' });
  }
};

export const getPatientStatsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const stats = await fetchPatientStats(patientId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching patient stats' });
  }
};