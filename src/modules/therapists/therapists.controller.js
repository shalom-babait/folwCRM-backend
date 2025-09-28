import { createTherapist, fetchTherapists } from "./therapists.service.js";

export async function createTherapistController(req, res) {
  try {
    const therapistData = req.body;
    
    // וולידציה בסיסית
    if (!therapistData.user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required"
      });
    }

    const newTherapist = await createTherapist(therapistData);
    
    res.status(201).json({
      success: true,
      data: newTherapist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getTherapidtController(req, res) {
  try {
    const therapists = await fetchTherapists();
    res.json(therapists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}