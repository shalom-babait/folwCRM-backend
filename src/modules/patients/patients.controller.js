import {
  createPatient,
  fetchPatientsByTherapist,
  fetchPatientDetails,
  fetchPatientStats,
  deletePatient,
  updatePatient,
  fetchPatientOnly
} from "./patients.service.js";
// מחזיר אובייקט מטופל בלבד
export const getPatientOnlyController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await fetchPatientOnly(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching patient" });
  }
};

export async function createPatientController(req, res) {
  try {
    const patientData = req.body;    
    // וולידציה בסיסית לשדות משתמש
    if (!patientData.user.first_name || !patientData.user.last_name || !patientData.user.email) {
      return res.status(400).json({
        success: false,
        message: "first_name, last_name and email are required"
      });
    }

    // // וולידציה על status
    // const validStatuses = ['פעיל', 'לא פעיל', 'בהמתנה'];
    // if (patientData.status && !validStatuses.includes(patientData.status)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid status value"
    //   });
    // }

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

export async function getAllPatientsController(req, res) {
  try {
    const allPatients = await fetchAllPatients();
    res.json(allPatients);
  } catch (error) {
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

export async function deletePatientController(req, res) {
  try {
    const { patientId } = req.params;

    // Validate patientId
    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID"
      });
    }

    const result = await deletePatient(patientId);

    if (result) {
      res.json({
        success: true,
        message: "Patient deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting patient"
    });
  }
}

export async function updatePatientController(req, res) {
  console.log('Update patientId:', req.params.patientId, 'Update data:', req.body);
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    // Validate patientId
    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID"
      });
    }

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    // Validate gender if provided
    if (updateData.gender) {
      const validGenders = ['זכר', 'נקבה', 'אחר'];
      if (!validGenders.includes(updateData.gender)) {
        return res.status(400).json({
          success: false,
          message: "Invalid gender value"
        });
      }
    }

    const result = await updatePatient(patientId, updateData);
    if (result && (result.userUpdateResult || result.patientUpdateResult)) {
      res.json({
        success: true,
        message: "Patient updated successfully",
        userUpdate: result.userUpdateResult,
        patientUpdate: result.patientUpdateResult
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Patient not found or no data updated",
        userUpdate: result.userUpdateResult,
        patientUpdate: result.patientUpdateResult
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating patient"
    });
  }
}
//     res.json(stats);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching patient stats' });
//   }
// };