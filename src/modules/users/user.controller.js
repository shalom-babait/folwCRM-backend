import { createUser, deleteUser, updateUser } from "./user.service.js";

export async function createUserController(req, res) {
  try {
    const userData = req.body;

    // וולידציה לשדות חובה של משתמש
    const requiredUserFields = ['email', 'password'];
    for (const field of requiredUserFields) {
      if (!userData[field] || typeof userData[field] !== 'string' || userData[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // וולידציה לשדות חובה של פרטים אישיים (אם נדרשים)
    const requiredPersonFields = ['first_name', 'last_name', 'phone'];
    for (const field of requiredPersonFields) {
      if (!userData[field] || typeof userData[field] !== 'string' || userData[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // וולידציה על תפקיד
    const validRoles = ['secretary', 'manager', 'therapist', 'patient', 'other'];
    if (userData.role && !validRoles.includes(userData.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value. Must be one of: secretary, manager, therapist, patient, other"
      });
    }

    // וולידציה על agree (0 או 1)
    if (userData.agree !== undefined && userData.agree !== 0 && userData.agree !== 1) {
      return res.status(400).json({
        success: false,
        message: "Agree field must be 0 or 1"
      });
    }

    // ניקוי רווחים מיותרים
    userData.email = userData.email.trim().toLowerCase();
    if (userData.address) userData.address = userData.address.trim();
    if (userData.teudat_zehut) userData.teudat_zehut = userData.teudat_zehut.trim();
    if (userData.first_name) userData.first_name = userData.first_name.trim();
    if (userData.last_name) userData.last_name = userData.last_name.trim();
    if (userData.phone) userData.phone = userData.phone.trim();

    // יצירת משתמש חדש
    const newUser = await createUser(userData);

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID"
      });
    }
    const result = await deleteUser(id);
    if (result) {
      res.json({
        success: true,
        message: "User deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting User"
    });
  }
}

export async function updateUserController(req, res) {
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
    
    const result = await updateUser(id, updateData);
    if (result) {
      res.json({
        success: true,
        message: "User updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found or no changes made"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating User"
    });
    console.log(error.message);
    
  }
}




