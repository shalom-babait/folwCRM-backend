import { 
    create, 
    getPatientsByTherapist, 
    getPatientDetails, 
    getPatientStats,
    deleteFromPatients,
    updateToPatients
} from "./patients.repo.js";

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

export async function deletePatient(patientId) {
    try {
        // Check if patient exists
        const patient = await getPatientDetails(patientId);
        if (!patient) {
            return false;
        }
        
        return await deleteFromPatients(patientId);
    } catch (error) {
        throw error;
    }
}

export async function updatePatient(patientId, updateData) {
    try {
        // Check if patient exists
        const patient = await getPatientDetails(patientId);
        if (!patient) {
            return false;
        }

        // Validate birth date if provided
        if (updateData.birth_date) {
            const birthDate = new Date(updateData.birth_date);
            const today = new Date();
            if (birthDate > today) {
                throw new Error("Birth date cannot be in the future");
            }
        }

        return await updateToPatients(patientId, updateData);
    } catch (error) {
        throw error;
    }
    return patientDetails;

};

export const fetchPatientStats = async (patientId) => {
    const stats = await getPatientStats(patientId);
    return stats;
};