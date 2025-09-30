// import * as patientService from './patient.service.js';

// export async function getPatientsByTherapist(req, res) {
//   try {
//     const { therapistId } = req.params;
//     const patients = await patientService.getPatientsByTherapist(therapistId); 
//     res.json(patients);
//   } catch (err) {
//     console.error("Error in controller:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// export const getPatientDetailsController = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const details = await patientService.fetchPatientDetails(patientId);
//     res.json(details);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching patient details' });
//   }
// };

// export const getPatientStatsController = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const stats = await patientService.fetchPatientStats(patientId);
//     res.json(stats);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching patient stats' });
//   }
// };
import * as patientService from './patient.service.js';

export async function getPatientsByTherapistController(req, res) {
  try {
    const { therapistId } = req.params;
    console.log("Requested therapistId:", therapistId); // בדיקה
    const patients = await patientService.fetchPatientsByTherapist(therapistId);
    console.log("Found patients:", patients); // בדיקה
    res.json(patients);
  } catch (err) {
    console.error("Error in controller:", err.sqlMessage || err);
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