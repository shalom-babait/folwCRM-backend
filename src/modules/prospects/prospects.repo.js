/**
 * עדכון prospect כולל עדכון קטגוריות
 */
export async function updateProspectWithCategories(prospectId, updateData) {
  // 1. עדכון שדות בסיסיים
  const allowedFields = [
    'first_name','last_name','phone','phone_alt','email','city','referral_source','reason_for_visit','notes','status','converted_to_patient_id'
  ];
  const fields = [];
  const values = [];
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }
  if (fields.length) {
    values.push(prospectId);
    const sql = `UPDATE Prospects SET ${fields.join(', ')} WHERE prospect_id = ?`;
    await pool.query(sql, values);
  }

  // 2. עדכון קטגוריות (אם נשלח categories)
  if (Array.isArray(updateData.categories)) {
    // מחיקת כל השיוכים הקיימים
    await pool.query(`DELETE FROM ProspectCategories WHERE prospect_id = ?`, [prospectId]);
    // הוספת כל הקטגוריות החדשות
    const categoryIds = updateData.categories.map(c => typeof c === 'object' ? c.category_id : c).filter(Boolean);
    if (categoryIds.length > 0) {
      const catValues = categoryIds.map(cid => [prospectId, cid]);
      await pool.query(
        `INSERT INTO ProspectCategories (prospect_id, category_id) VALUES ?`,
        [catValues]
      );
    }
  }
  return { success: true };
}
/**
 * עדכון prospect קיים
 */
export async function updateProspect(prospectId, updateData) {
  // בנה דינמית את הסט של השדות לעדכון
  const allowedFields = [
    'first_name','last_name','phone','phone_alt','email','city','referral_source','reason_for_visit','notes','status','converted_to_patient_id'
  ];
  const fields = [];
  const values = [];
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }
  if (!fields.length) return { affectedRows: 0 };
  values.push(prospectId);
  const sql = `UPDATE Prospects SET ${fields.join(', ')} WHERE prospect_id = ?`;
  const [result] = await pool.query(sql, values);
  return result;
}
import pool from "../../services/database.js";

/**
 * שליפת כל המתעניינים
 */
export async function getAllProspects() {
  // שלב 1: שליפת כל המתעניינים
  const [prospects] = await pool.query("SELECT * FROM Prospects ORDER BY created_at DESC");
  if (!prospects.length) return [];

  // שלב 2: שליפת כל השיוכים prospect_id -> קטגוריות
  const prospectIds = prospects.map(p => p.prospect_id);
  const [catRows] = await pool.query(`
    SELECT pc.prospect_id, c.*
    FROM ProspectCategories pc
    JOIN Categories c ON pc.category_id = c.category_id
    WHERE pc.prospect_id IN (?)
  `, [prospectIds]);

  // שלב 3: איגוד לפי prospect_id
  const catsByProspect = {};
  for (const row of catRows) {
    if (!catsByProspect[row.prospect_id]) catsByProspect[row.prospect_id] = [];
    catsByProspect[row.prospect_id].push({
      category_id: row.category_id,
      category_type: row.category_type,
      category_name: row.category_name,
      description: row.description,
      color: row.color,
      icon: row.icon,
      display_order: row.display_order,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }

  // שלב 4: הוספת categories לכל prospect
  return prospects.map(p => ({
    ...p,
    categories: catsByProspect[p.prospect_id] || []
  }));
}

/**
 * יצירת prospect חדש בטבלת Prospects
 */
export async function createProspect(prospectData) {
  console.log('Creating prospect with data:', prospectData);
  const {
    first_name,
    last_name,
    phone,
    phone_alt,
    email,
    city,
    referral_source,
    reason_for_visit,
    notes,
    status,
    converted_to_patient_id,
    category_ids // מערך של מזהי קטגוריות (או undefined)
  } = prospectData;
  const sql = `
    INSERT INTO Prospects (
      first_name, last_name, phone, phone_alt, email, city, referral_source, reason_for_visit, notes, status, converted_to_patient_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    phone,
    phone_alt || null,
    email || null,
    city || null,
    referral_source || null,
    reason_for_visit || null,
    notes || null,
    status || 'new',
    converted_to_patient_id || null
  ];
  try {
    const [result] = await pool.execute(sql, values);
    const prospect_id = result.insertId;

    // שיוך קטגוריות אם נשלח
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const catValues = category_ids.map(cid => [prospect_id, cid]);
      await pool.query(
        `INSERT INTO ProspectCategories (prospect_id, category_id) VALUES ?`,
        [catValues]
      );
    }

    return {
      prospect_id,
      ...prospectData,
    };
  } catch (error) {
    throw error;
  }
}
