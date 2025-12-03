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
    // אם יש מידע אישי מהטבלה Person, נחזיר אותו
    if (result.user && result.user.person_id && result.user.first_name) {
      response.person = {
        person_id: result.user.person_id,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        phone: result.user.phone,
        teudat_zehut: result.user.teudat_zehut,
        city: result.user.city,
        address: result.user.address,
        birth_date: result.user.birth_date,
        gender: result.user.gender
      };
    }
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