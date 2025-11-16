import { loginService } from './login.service.js';

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    // מחזירים רק מזהה רלוונטי לפי role
    const userRole = result.user?.role;
    const response = {
      success: true,
      token: result.token,
      user: result.user,
      message: result.message
    };
    if (userRole === 'therapist' && result.therapist_id) {
      response.therapist_id = result.therapist_id;
    } else if (userRole === 'patient' && result.patient_id) {
      response.patient_id = result.patient_id;
    } else if (userRole === 'secretary' && result.secretary_id) {
      response.secretary_id = result.secretary_id;
    }
    res.json(response);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}