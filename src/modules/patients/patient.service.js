import * as patientRepo from './patient.repo.js';

export async function fetchPatientsByTherapist(therapistId) {
  // אפשר להוסיף לוגיקה נוספת, למשל פורמט תאריכים
  const patients = await getPatientsByTherapist(therapistId);
  return patients;
}

export const fetchPatientDetails = async (patientId) => {
  const patientDetails = await patientRepo.getPatientDetails(patientId);
  return patientDetails;
};

export const fetchPatientStats = async (patientId) => {
  const stats = await patientRepo.getPatientStats(patientId);
  return stats;
};
