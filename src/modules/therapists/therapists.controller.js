import {
  createTherapist,fetchTherapists,updateTherapist
} from "./therapists.service.js";

export async function createTherapistController(req, res) {
  try {
    const { user, therapist,selectedDepartments  } = req.body;
    // שלב 1: בדיקת ייבוא סכמות
    try {
      const { userSchema } = await import('../../models/user.model.js');
      const { therapistSchema } = await import('../../models/therapist.model.js');
      // שלב 2: ולידציה
      const userValidation = userSchema.validate(user);
      const therapistValidation = therapistSchema.validate(therapist);
      if (userValidation.error) {
        return res.status(400).json({ success: false, message: userValidation.error.message });
      }
      if (therapistValidation.error) {
        return res.status(400).json({ success: false, message: therapistValidation.error.message });
      }
      // שלב 3: יצירת מטפל
      try {
        const newTherapist = await createTherapist({ user, therapist, selectedDepartments });
        res.status(201).json({ success: true, data: newTherapist });
      } catch (serviceError) {
        res.status(500).json({ success: false, message: serviceError.message || 'Error in createTherapist' });
      }
    } catch (importError) {
      res.status(500).json({ success: false, message: importError.message || 'Error importing schemas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTherapistController(req, res) {
  try {
    console.log("In getTherapistController");
    const therapists = await fetchTherapists();
    res.json(therapists);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateTherapistController(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID"
      });
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    const result = await updateTherapist(id, updateData);
    if (result) {
      res.json({
        success: true,
        message: "Therapist updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Therapist not found or no changes made"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating Therapist"
    });
    console.log(error.message);

  }
}