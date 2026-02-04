import { loginService } from './login.service.js';
import bcrypt from 'bcryptjs';

export async function loginController(req, res) {
  try {
  // קבלה של user_name בלבד
  const { user_name, password } = req.body;
  const result = await loginService(user_name, password);
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

import { findByUserName, setTempPassword, updatePassword } from '../users/user.repo.js';
import { sendMail } from '../../services/email.js';

/**
 * שליחת מייל לשחזור סיסמה
 * מקבל user_name, יוצר סיסמה זמנית עם תוקף 5 דקות
 */
export async function forgotPasswordController(req, res) {
  try {
    const { user_name } = req.body;

    if (!user_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'חובה להזין שם משתמש' 
      });
    }

    // חיפוש המשתמש לפי user_name
    const user = await findByUserName(user_name);
    
    if (!user) {
      // מטעמי אבטחה, לא נגלה שהמשתמש לא קיים
      return res.status(200).json({ 
        success: true, 
        message: 'אם שם המשתמש קיים במערכת, נשלחה סיסמה זמנית למייל הרשום' 
      });
    }

    // בדיקה שיש מייל בטבלת person
    if (!user.email) {
      console.error(`User ${user_name} has no email in person table`);
      return res.status(200).json({ 
        success: true, 
        message: 'אם שם המשתמש קיים במערכת, נשלחה סיסמה זמנית למייל הרשום' 
      });
    }

    // יצירת סיסמה זמנית (8 תווים אקראיים)
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // שמירת הסיסמה הזמנית (לא נוגעים בסיסמה הקבועה!)
    await setTempPassword(user.user_id, tempPassword);

    // שליחת המייל
    const emailSubject = 'שחזור סיסמה - FLOW CRM';
    const emailBody = `
    שלום ${user.first_name || 'משתמש יקר'},

    קיבלנו בקשה לאיפוס סיסמה לחשבון שלך במערכת FLOW CRM.

    הסיסמה החדשה שלך היא: ${tempPassword}

    ⚠️ חשוב: סיסמה זו תקפה ל-5 דקות בלבד!
    לאחר כניסה ראשונה, זו תהפוך לסיסמה הקבועה שלך.

    שם המשתמש שלך: ${user.user_name}

    בברכה,
    צוות Flow CRM
    `;

    await sendMail({
      recipient: user.email,
      subject: emailSubject,
      body: emailBody
    });

    console.log(`Password reset email sent to: ${user.email} for user: ${user_name}`);

    res.status(200).json({ 
      success: true, 
      message: 'סיסמה זמנית נשלחה למייל הרשום במערכת (תוקף: 5 דקות)' 
    });

  } catch (error) {
    console.error('Error in forgotPasswordController:', error);
    res.status(500).json({ 
      success: false, 
      message: 'שגיאה בשליחת מייל לשחזור סיסמה' 
    });
  }
}

/**
 * החלפת סיסמה (משתמש מחובר)
 * מקבל user_name, סיסמה ישנה, סיסמה חדשה
 */
export async function changePasswordController(req, res) {
  try {
    const { user_name, oldPassword, newPassword } = req.body;

    if (!user_name || !oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'חובה להזין שם משתמש, סיסמה ישנה וסיסמה חדשה' 
      });
    }

    // חיפוש המשתמש
    const user = await findByUserName(user_name);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'שם משתמש או סיסמה שגויים' 
      });
    }

    // בדיקה שהסיסמה הישנה נכונה
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isOldPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'הסיסמה הישנה שגויה' 
      });
    }

    // עדכון לסיסמה החדשה
    await updatePassword(user.user_id, newPassword);

    console.log(`Password changed successfully for user: ${user_name}`);

    res.status(200).json({ 
      success: true, 
      message: 'הסיסמה שונתה בהצלחה' 
    });

  } catch (error) {
    console.error('Error in changePasswordController:', error);
    res.status(500).json({ 
      success: false, 
      message: 'שגיאה בהחלפת סיסמה' 
    });
  }
}
