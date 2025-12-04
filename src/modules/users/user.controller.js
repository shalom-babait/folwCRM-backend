import { createUser, deleteUser, updateUser } from "./user.service.js";

export async function createUserController(req, res) {
  try {
    const userData = req.body;

    // וולידציה רק לשדות של Users
    const requiredFields = ['email', 'password'];
    for (const field of requiredFields) {
      if (!userData[field] || userData[field].trim() === '') {
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

    // שדות אישיים עוברים ל־Person דרך ה־service/repo
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




// import { addUser } from './user.service.js';

// export async function createUser(req, res) {
//   try {
//     const user = await addUser(req.body);
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }

// const service = require('./user.service');

// const create = async (req, res) => {
//   const user = await service.create(req.body);
//   res.status(201).json(user);
// };

// const getById = async (req, res) => {
//   const user = await service.getById(req.params.id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   res.json(user);
// };

// module.exports = { create, getById };
