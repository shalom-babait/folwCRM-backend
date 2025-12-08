
import {
    create,
    getPatientsByTherapist,
    getPatientDetails,
    getPatientStats,
    deleteFromPatients,
    updateToPatients,
    getPatientOnly,
    updateToUsers,
    createUser,
    getPatientFullData,
    getAllPatients
} from "./patients.repo.js";
import pool from '../../services/database.js';
// שליפת נתוני מטופל בלבד
export const fetchPatientOnly = async (patientId) => {
    const patient = await getPatientOnly(patientId);
    return patient;
};

export async function createPatient(patientData) {
    try {
        // מצפה ל-PatientCreationData: { person, patient, selectedDepartments }
        const { person, patient, selectedDepartments } = patientData;

        // יצירת פרסון
        const personFields = {
            first_name: person.first_name,
            last_name: person.last_name,
            teudat_zehut: person.teudat_zehut,
            phone: person.phone,
            city: person.city,
            address: person.address,
            birth_date: person.birth_date,
            gender: person.gender
        };
        // assume createPerson returns { person_id, ...fields }
        const newPerson = await pool.query(
            `INSERT INTO Person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                personFields.first_name,
                personFields.last_name,
                personFields.teudat_zehut || null,
                personFields.phone || null,
                personFields.city || null,
                personFields.address || null,
                personFields.birth_date || null,
                personFields.gender || 'other'
            ]
        );
        const person_id = newPerson[0].insertId;

        // יצירת מטופל עם person_id
        const patientInsertData = {
            ...patient,
            user_id: null, // לא נוצר יוזר
            person_id
        };
        const patientSql = `INSERT INTO Patients (person_id, therapist_id, status, history_notes)
            VALUES (?, ?, ?, ?)`;
        const patientResult = await pool.query(
            patientSql,
            [
                patientInsertData.person_id,
                patientInsertData.therapist_id || null,
                patientInsertData.status || 'פעיל',
                patientInsertData.history_notes || null
            ]
        );
        const newPatient = {
            patient_id: patientResult[0].insertId,
            ...patientInsertData
        };


        // שיוך למחלקות וקבוצות
        if (Array.isArray(selectedDepartments)) {
            for (const dep of selectedDepartments) {
                const depSql = `INSERT INTO UserDepartments (person_id, department_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)`;
                await pool.query(depSql, [person_id, dep.department_id]);
                if (Array.isArray(dep.group_ids)) {
                    for (const groupId of dep.group_ids) {
                        const groupSql = `INSERT INTO UserGroups (person_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = VALUES(group_id)`;
                        await pool.query(groupSql, [person_id, groupId]);
                    }
                }
            }
        }

        return {
            person: {
                person_id,
                ...personFields
            },
            patient: newPatient,
            selectedDepartments: selectedDepartments || []
        };
    } catch (error) {
        console.error('--- שגיאה ב-service ביצירת מטופל ---');
        console.error(error);
        throw error;
    }
}

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

        // כאן יש לעדכן את Person במקום Users
        // לדוגמה: await updateToPerson(patient.person_id, personUpdate);
        // כרגע, אם אין פונקציה כזו, יש להוסיף אותה בעתיד

        let personUpdateResult = null;
        let patientUpdateResult = null;
        // Update Person table if needed
        if (Object.keys(personUpdate).length > 0) {
            if (patient.person_id) {
                // personUpdateResult = await updateToPerson(patient.person_id, personUpdate);
            } else {
                console.log('No person_id found for patient, cannot update Person table');
            }
        }
        // Update Patients table
        if (Object.keys(patientUpdate).length > 0) {
            patientUpdateResult = await updateToPatients(patientId, patientUpdate);
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