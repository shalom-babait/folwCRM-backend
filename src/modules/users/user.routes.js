
import express from "express";
import { createUserController, deleteUserController, updateUserController } from "./user.controller.js";
import { loginController } from "../login/login.controller.js";
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();


// POST /api/users - יצירת משתמש חדש
router.post("/", createUserController);
router.post("/login", loginController);
// ראוטים מוגנים – דורשים טוקן תקין
router.delete("/deleteUser/:id", authenticateToken, deleteUserController);
router.put("/updateUser/:id", authenticateToken, updateUserController);

export default router;