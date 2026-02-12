import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../services/database.js';
import jwt from 'jsonwebtoken';

// תצורת Google OAuth Strategy
export function configureGoogleAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';

          if (!email) {
            return done(new Error('לא ניתן לקבל מייל מ-Google'), null);
          }

          // בדיקה אם המשתמש כבר קיים במערכת
          // חיפוש לפי google_id (אם כבר התחבר בעבר) או לפי email בטבלת person
          const [existingUsers] = await pool.query(
            `SELECT u.user_id, u.organization_id, u.user_name, u.created_at, u.agree, 
                    u.role, u.person_id, u.google_id, u.auth_provider,
                    p.first_name, p.last_name, p.phone, p.email, 
                    p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
             FROM users u
             INNER JOIN person p ON u.person_id = p.person_id
             WHERE u.google_id = ? OR p.email = ?`,
            [googleId, email]
          );

          let user = existingUsers[0];

          if (user) {
            // משתמש קיים במערכת - מאפשרים כניסה
            if (!user.google_id) {
              // משתמש קיים שהתחבר לראשונה דרך Google - עדכן google_id
              await pool.query(
                'UPDATE users SET google_id = ?, auth_provider = ? WHERE user_id = ?',
                [googleId, 'google', user.user_id]
              );
              console.log(`משתמש קיים ${email} חובר ל-Google ID`);
            }
            
            // המשתמש כבר נטען עם כל הנתונים מ-JOIN למעלה
            return done(null, user);
          } else {
            // משתמש לא קיים במערכת - דחיית ההתחברות
            console.log(`ניסיון כניסה נכשל - המייל ${email} לא רשום במערכת`);
            return done(new Error('המשתמש אינו רשום במערכת. אנא פנה למנהל המערכת.'), null);
          }
        } catch (error) {
          console.error('שגיאה ב-Google Strategy:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialization (לא בשימוש אקטיבי אבל נדרש על ידי passport)
  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
      done(null, users[0]);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
