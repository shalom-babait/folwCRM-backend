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
      organization_id: result.organization_id, // הוספת organization_id
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
    const emailHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 שחזור סיסמה</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center;">
                                <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">
                                    שלום <strong>${user.first_name || 'משתמש יקר'}</strong>,
                                </p>
                                <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 30px;">
                                    קיבלנו בקשה לאיפוס סיסמה לחשבון שלך במערכת Flow CRM.
                                </p>
                                
                                <!-- Password Box -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0;">
                                    <p style="font-size: 14px; color: #666666; margin: 0 0 10px 0;">הסיסמה הזמנית שלך:</p>
                                    <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                                        ${tempPassword}
                                    </p>
                                </div>

                                <!-- Warning Box -->
                                <div style="background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: right;">
                                    <p style="margin: 0; color: #856404; font-size: 14px;">
                                        <strong>⚠️ חשוב:</strong> סיסמה זו תקפה ל-<strong>5 דקות</strong> בלבד!<br>
                                        לאחר כניסה ראשונה, זו תהפוך לסיסמה הקבועה שלך.
                                    </p>
                                </div>

                                <p style="font-size: 14px; color: #666666; margin-top: 20px;">
                                    שם המשתמש שלך: <strong style="color: #333;">${user.user_name}</strong>
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                                <p style="margin: 0; color: #666666; font-size: 14px;">
                                    בברכה,<br>
                                    <strong style="color: #667eea;">צוות Flow CRM</strong>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    await sendMail({
      recipient: user.email,
      subject: emailSubject,
      html: emailHTML
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
