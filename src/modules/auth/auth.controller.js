import passport from '../../config/passport.js';
import { createAuthToken, getUserRoleIds, prepareAuthResponse } from './auth.service.js';

/**
 * Controller להתחלת תהליך אימות Google
 */
export function initiateGoogleAuth(req, res, next) {
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })(req, res, next);
}

/**
 * Middleware לטיפול באימות Google
 */
export function handleGoogleAuth(req, res, next) {
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}?error=google_auth_failed`
  }, (err, user, info) => {
    // טיפול בשגיאה
    if (err) {
      console.error('שגיאה באימות Google:', err);
      if (err.message && err.message.includes('אינו רשום במערכת')) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=user_not_registered`);
      }
      return res.redirect(`${process.env.FRONTEND_URL}?error=auth_error`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_user`);
    }
    req.user = user;
    next();
  })(req, res, next);
}

/**
 * Controller לטיפול ב-callback מ-Google
 */
export async function googleCallbackController(req, res) {
  try {
    const user = req.user;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_user`);
    }

    // יצירת JWT Token
    const token = createAuthToken(user.user_id, user.role);

    // קבלת מזהים נוספים לפי התפקיד
    const roleIds = await getUserRoleIds(user.user_id, user.role);

    // הכנת אובייקט התגובה
    const responseData = prepareAuthResponse(user, token, roleIds);

    // המרת הנתונים ל-Base64 להעברה ב-URL
    const encodedData = Buffer.from(JSON.stringify(responseData)).toString('base64');

    // ניתוב למסך ההתחברות עם הנתונים
    res.redirect(`${process.env.FRONTEND_URL}?googleAuth=${encodedData}`);
  } catch (error) {
    console.error('שגיאה ב-Google callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=callback_error`);
  }
}
