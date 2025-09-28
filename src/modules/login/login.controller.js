import { loginUser } from "../users/user.service.js";

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    
    // וולידציה בסיסית
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // ניקוי רווחים מיותרים
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const loginResult = await loginUser(cleanEmail, cleanPassword);
    
    res.status(200).json({
      success: true,
      data: loginResult
    });
  } catch (error) {
    // טיפול בשגיאות התחברות
    if (error.message === "User not found" || error.message === "Invalid password") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}