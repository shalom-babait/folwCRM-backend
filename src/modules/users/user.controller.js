import { createUser } from "./user.service.js";

export async function createUserController(req, res) {
  try {
    const userData = req.body;
    
    // וולידציה בסיסית על שדות חובה
    const requiredFields = ['first_name', 'last_name', 'phone', 'city', 'email', 'password'];
    
    for (const field of requiredFields) {
      if (!userData[field] || userData[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // וולידציה על תפקיד
    const validRoles = ['מזכיר', 'מנהל', 'מטפל', 'מטופל'];
    if (userData.role && !validRoles.includes(userData.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value. Must be one of: מזכיר, מנהל, מטפל, מטופל"
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
    userData.first_name = userData.first_name.trim();
    userData.last_name = userData.last_name.trim();
    userData.phone = userData.phone.trim();
    userData.city = userData.city.trim();
    userData.email = userData.email.trim().toLowerCase();
    if (userData.address) userData.address = userData.address.trim();
    if (userData.teudat_zehut) userData.teudat_zehut = userData.teudat_zehut.trim();

    const newUser = await createUser(userData);
    
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    // בדיקה אם השגיאה היא duplicate entry
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
