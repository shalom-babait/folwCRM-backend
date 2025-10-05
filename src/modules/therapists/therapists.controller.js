import {
  createTherapist,
  fetchTherapists,
  deleteTherapist,
  updateTherapist
} from "./therapists.service.js";

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
export async function deleteTherapistController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID"
      });
    }
    const result = await deleteTherapist(id);
    if (result) {
      res.json({
        success: true,
        message: "Therapist deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Therapist not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting Therapist"
    });
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