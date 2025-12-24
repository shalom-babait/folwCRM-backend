/**
 * פונקציית שירות להוספת מטופל חדש
 * מקבלת אובייקט { person, patient, selectedDepartments }
 * קוראת ל-createPatient מה-repo ומחזירה את התוצאה
 */
export async function addPatient(patientData) {
    // patientData: { person, patient, selectedDepartments }
    return await createPatient(patientData);
}

import {
    createPatient,
    getPatientsByTherapist,
    getPatientDetails,
    getPatientStats,
    deleteFromPatients,
    updateToPatients,
    getPatientOnly,
    getPatientFullData,
    getAllPatients
} from "./patients.repo.js";
import { updatePerson } from "../person/person.repo.js";
// שליפת נתוני מטופל בלבד
export const fetchPatientOnly = async (patientId) => {
    const patient = await getPatientOnly(patientId);
    return patient;
};


export async function fetchPatientsByTherapist(therapistId) {
    // אפשר להוסיף לוגיקה נוספת, למשל פורמט תאריכים
    const patients = await getPatientsByTherapist(therapistId);
    
    return patients;
}

export async function fetchAllPatients() {
    const allPatients = await getAllPatients();
    return allPatients.map(item => ({
        ...item,
        selectedDepartments: []
    }));
}

export const fetchPatientDetails = async (patientId) => {
    return await getPatientFullData(patientId);
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
            const yyyy = birthDate.getFullYear();
            const mm = String(birthDate.getMonth() + 1).padStart(2, '0');
            const dd = String(birthDate.getDate()).padStart(2, '0');
            updateData.birth_date = `${yyyy}-${mm}-${dd}`;
        }

        // Separate fields for Person and Patients tables
        const personFields = ['first_name', 'last_name', 'phone', 'teudat_zehut', 'city', 'address', 'birth_date', 'gender'];
        const patientFields = ['status', 'history_notes', 'therapist_id'];

        const personUpdate = {};
        const patientUpdate = {};
        for (const key in updateData) {
            if (personFields.includes(key)) personUpdate[key] = updateData[key];
            if (patientFields.includes(key)) patientUpdate[key] = updateData[key];
        }

        let personUpdateResult = null;
        let patientUpdateResult = null;
        // חיפוש person_id גם תחת patient.person וגם תחת person
        let personId = patient.person_id;
        if (!personId && patient.person && patient.person.person_id) {
            personId = patient.person.person_id;
        }
        if (!personId && personUpdate.person_id) {
            personId = personUpdate.person_id;
        }
        // Update Person table if needed
        if (Object.keys(personUpdate).length > 0) {
            if (personId) {
                console.log('[updatePatient] Updating person:', personId, personUpdate);
                personUpdateResult = await updatePerson(personId, personUpdate);
                console.log('[updatePatient] personUpdateResult:', personUpdateResult);
            } else {
                console.log('[updatePatient] No person_id found for patient, cannot update person table');
            }
        }
        // Update Patients table
        if (Object.keys(patientUpdate).length > 0) {
            console.log('[updatePatient] Updating patient:', patientId, patientUpdate);
            patientUpdateResult = await updateToPatients(patientId, patientUpdate);
            console.log('[updatePatient] patientUpdateResult:', patientUpdateResult);
        }
        return { personUpdateResult, patientUpdateResult };
    } catch (error) {
        throw error;
    }
};

export const fetchPatientStats = async (patientId) => {
    const stats = await getPatientStats(patientId);
    return stats;
};