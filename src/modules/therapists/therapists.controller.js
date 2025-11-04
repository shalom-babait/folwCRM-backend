import { fetchTherapistIdByUserId } from "./therapists.service.js";
// מחזיר therapist_id לפי user_id
export async function getTherapistIdByUserIdController(req, res) {
  try {
    const user_id = req.params.user_id;
    const therapist_id = await fetchTherapistIdByUserId(user_id);
    if (therapist_id) {
      res.json({ therapist_id });
    } else {
      res.status(404).json({ message: "Therapist not found for user_id " + user_id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
import {
  createTherapist,fetchTherapists,updateTherapist
} from "./therapists.service.js";

export async function createTherapistController(req, res) {
  console.log("In createTherapistController");
  console.log("Request body:", req.body);
  try {
    const { user, therapist } = req.body;
    console.log('user:', user);
    console.log('therapist:', therapist);
    // שלב 1: בדיקת ייבוא סכמות
    try {
      const { userSchema } = await import('../../models/user.model.js');
      console.log('userSchema imported:', !!userSchema);
      const { therapistSchema } = await import('../../models/therapist.model.js');
      console.log('therapistSchema imported:', !!therapistSchema);
      // שלב 2: ולידציה
      const userValidation = userSchema.validate(user);
      console.log('userValidation:', userValidation);
      const therapistValidation = therapistSchema.validate(therapist);
      console.log('therapistValidation:', therapistValidation);
      if (userValidation.error) {
        console.log('User validation error:', userValidation.error.message);
        return res.status(400).json({ success: false, message: userValidation.error.message });
      }
      if (therapistValidation.error) {
        console.log('Therapist validation error:', therapistValidation.error.message);
        return res.status(400).json({ success: false, message: therapistValidation.error.message });
      }
      // שלב 3: יצירת מטפל
      try {
        const newTherapist = await createTherapist({ user, therapist });
        console.log('newTherapist:', newTherapist);
        res.status(201).json({ success: true, data: newTherapist });
      } catch (serviceError) {
        console.log('Error in createTherapist:', serviceError);
        res.status(500).json({ success: false, message: serviceError.message || 'Error in createTherapist' });
      }
    } catch (importError) {
      console.log('Error importing schemas:', importError);
      res.status(500).json({ success: false, message: importError.message || 'Error importing schemas' });
    }
  } catch (error) {
    console.log('General error in controller:', error);
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