import { create, getPatientsByTherapist, getPatientDetails, getPatientStats } from "./patients.repo.js";

export async function createPatient(patientData) {
    try {
        // וולידציה על תאריך לידה
        if (patientData.birth_date) {
            const birthDate = new Date(patientData.birth_date);
            const today = new Date();
            if (birthDate > today) {
                throw new Error("Birth date cannot be in the future");
            }
        }

        const newPatient = await create(patientData);
        return newPatient;
    } catch (error) {
        throw error;
    }
}

export async function fetchPatientsByTherapist(therapistId) {
    // אפשר להוסיף לוגיקה נוספת, למשל פורמט תאריכים
    const patients = await getPatientsByTherapist(therapistId);
    return patients;
}

export const fetchPatientDetails = async (patientId) => {
    const patientDetails = await getPatientDetails(patientId);
    return patientDetails;
};

export const fetchPatientStats = async (patientId) => {
    const stats = await getPatientStats(patientId);
    return stats;
};