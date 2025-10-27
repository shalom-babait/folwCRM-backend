

import { 
    create, 
    getPatientsByTherapist, 
    getPatientDetails, 
    getPatientStats,
    deleteFromPatients,
    updateToPatients,
    getPatientOnly,
    updateToUsers
} from "./patients.repo.js";

// שליפת נתוני מטופל בלבד
export const fetchPatientOnly = async (patientId) => {
    const patient = await getPatientOnly(patientId);
    return patient;
};

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
    const patient = await getPatientOnly(patientId);
        if (!patient) {
            return false;
        }

        // Validate and fix birth date format if provided
        if (updateData.birth_date) {
            let birthDate = new Date(updateData.birth_date);
            const today = new Date();
            if (birthDate > today) {
                throw new Error("Birth date cannot be in the future");
            }
            // Convert to YYYY-MM-DD for MySQL
            const yyyy = birthDate.getFullYear();
            const mm = String(birthDate.getMonth() + 1).padStart(2, '0');
            const dd = String(birthDate.getDate()).padStart(2, '0');
            updateData.birth_date = `${yyyy}-${mm}-${dd}`;
        }

        // Separate fields for Users and Patients tables
        const userFields = ['first_name', 'last_name', 'phone', 'email', 'address', 'teudat_zehut', 'city'];
        const patientFields = ['birth_date', 'gender', 'status', 'history_notes', 'therapist_id'];

        const userUpdate = {};
        const patientUpdate = {};
        for (const key in updateData) {
            if (userFields.includes(key)) userUpdate[key] = updateData[key];
            if (patientFields.includes(key)) patientUpdate[key] = updateData[key];
        }

        // לוג נוסף לבדוק user_id
        console.log('user_id from patient:', patient.user_id);
        // Update Users table if needed
        let userUpdateResult = null;
        let patientUpdateResult = null;
        if (Object.keys(userUpdate).length > 0) {
            if (patient.user_id) {
                console.log('Calling updateToUsers with:', patient.user_id, userUpdate);
                userUpdateResult = await updateToUsers(patient.user_id, userUpdate);
                console.log('Result from updateToUsers:', userUpdateResult);
            } else {
                console.log('No user_id found for patient, cannot update Users table');
            }
        }
        // Update Patients table
        if (Object.keys(patientUpdate).length > 0) {
            console.log('Calling updateToPatients with:', patientId, patientUpdate);
            patientUpdateResult = await updateToPatients(patientId, patientUpdate);
            console.log('Result from updateToPatients:', patientUpdateResult);
        }
        return { userUpdateResult, patientUpdateResult };
    } catch (error) {
        throw error;
    }
};

export const fetchPatientStats = async (patientId) => {
    const stats = await getPatientStats(patientId);
    return stats;
};