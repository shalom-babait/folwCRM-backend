import pool from '../services/database.js';

/**
 * Middleware להוספת organization_id ל-request
 * מושך את ה-organization_id של המשתמש המחובר מהמסד נתונים
 * ושומר אותו ב-req.organization_id
 */
export async function addOrganizationId(req, res, next) {
  try {
    // בדיקה אם יש משתמש מחובר (מגיע מה-authenticate middleware)
    if (!req.user || !req.user.id) {
      console.log('[organization.middleware] No authenticated user found');
      return next();
    }

    const userId = req.user.id;

    // שליפת organization_id של המשתמש
    const [rows] = await pool.query(
      'SELECT organization_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows && rows[0] && rows[0].organization_id) {
      req.organization_id = rows[0].organization_id;
      console.log(`[organization.middleware] Set organization_id=${req.organization_id} for user_id=${userId}`);
    } else {
      console.log(`[organization.middleware] No organization_id found for user_id=${userId}`);
    }

    next();
  } catch (error) {
    console.error('[organization.middleware] Error:', error);
    next(); // ממשיכים גם במקרה של שגיאה
  }
}
