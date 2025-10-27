import { loginService } from './login.service.js';

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Password received:', password ? 'Yes' : 'No');
    const result = await loginService(email, password);
    res.json({
      success: true,
      token: result.token,
      user: result.user,
      message: result.message
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}