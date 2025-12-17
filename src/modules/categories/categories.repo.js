import logger from "../../config/logger.js";
import pool from "../../services/database.js";

const CategoriesRepository = {
  // יצירת קטגוריה חדשה
  async create(categoryData) {
    try {
      const {
        category_type,
        category_name,
        description,
        color,
        icon,
        display_order
      } = categoryData;

      const [result] = await pool.query(
        `INSERT INTO categories
         (category_type, category_name, description, color, icon, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          category_type,
          category_name,
          description,
          color,
          icon,
          display_order
        ]
      );

      // return the inserted id so callers can fetch the new record
      return result.insertId;
    } catch (error) {
      logger.error("Error creating category:", error);
      throw error;
    }
  },

  // קבלת כל הקטגוריות
  async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM categories ORDER BY display_order ASC`
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving categories:", error);
      throw error;
    }
  },

  // קבלת קטגוריות לפי type (לשימוש ב-service)
  async findByType(type) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM categories WHERE category_type = ? AND (is_active IS NULL OR is_active = 1) ORDER BY display_order ASC`,
        [type]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving categories by type:", error);
      throw error;
    }
  },

  // קבלת קטגוריה לפי ID
  async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM categories WHERE category_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error("Error retrieving category by ID:", error);
      throw error;
    }
  },

  // עדכון קטגוריה
  async update(id, categoryData) {
    try {
      const {
        description,
        color,
        icon,
        display_order,
        is_active
      } = categoryData;

      await pool.query(
        `UPDATE categories 
         SET description = ?, color = ?, icon = ?, display_order = ?, is_active = ?
         WHERE category_id = ?`,
        [
          description,
          color,
          icon,
          display_order,
          is_active,
          id
        ]
      );

      return { success: true };
    } catch (error) {
      logger.error("Error updating category:", error);
      throw error;
    }
  },

  // סימון מחיקה רכה (soft delete)
  async softDelete(id) {
    try {
      await pool.query(
        `UPDATE categories SET is_active = 0 WHERE category_id = ?`,
        [id]
      );
      return { success: true };
    } catch (error) {
      logger.error("Error soft deleting category:", error);
      throw error;
    }
  },

  // מחיקת קטגוריה
  async delete(id) {
    try {
      await pool.query(
        `DELETE FROM categories WHERE category_id = ?`,
        [id]
      );

      return { success: true };
    } catch (error) {
      logger.error("Error deleting category:", error);
      throw error;
    }
  },

  // שיוך קטגוריות לפרוספקט
  async assignToProspect(prospectId, categoryIds) {
    try {
      await pool.query(`DELETE FROM prospect_categories WHERE prospect_id = ?`, [prospectId]);
      if (!Array.isArray(categoryIds) && categoryIds) categoryIds = [categoryIds];
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const values = categoryIds.map(id => [prospectId, id]);
        await pool.query(`INSERT INTO prospect_categories (prospect_id, category_id) VALUES ?`, [values]);
      }
      return { success: true };
    } catch (error) {
      logger.error("Error assigning categories to prospect:", error);
      throw error;
    }
  },

  // שליפת קטגוריות של פרוספקט
  async findProspectCategories(prospectId) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*
         FROM categories c
         JOIN prospect_categories pc ON c.category_id = pc.category_id
         WHERE pc.prospect_id = ?`,
        [prospectId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving prospect categories:", error);
      throw error;
    }
  },

  // שיוך קטגוריות למטופל
  async assignToPatient(patientId, categoryIds) {
    try {
      await pool.query(`DELETE FROM patientcategories WHERE patient_id = ?`, [patientId]);
      if (!Array.isArray(categoryIds) && categoryIds) categoryIds = [categoryIds];
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const values = categoryIds.map(id => [patientId, id]);
        await pool.query(`INSERT INTO patientcategories (patient_id, category_id) VALUES ?`, [values]);
      }
      return { success: true };
    } catch (error) {
      logger.error("Error assigning categories to patient:", error);
      throw error;
    }
  },

  // שליפת קטגוריות של מטופל
  async findPatientCategories(patientId) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*
         FROM categories c
         JOIN patientcategories pc ON c.category_id = pc.category_id
         WHERE pc.patient_id = ?`,
        [patientId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving patient categories:", error);
      throw error;
    }
  },

  // שיוך קטגוריות למשתמש
  async assignToUser(userId, categoryIds) {
    try {
      await pool.query(`DELETE FROM UserCategories WHERE user_id = ?`, [userId]);
      if (!Array.isArray(categoryIds) && categoryIds) categoryIds = [categoryIds];
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const values = categoryIds.map(id => [userId, id]);
        await pool.query(`INSERT INTO UserCategories (user_id, category_id) VALUES ?`, [values]);
      }
      return { success: true };
    } catch (error) {
      logger.error("Error assigning categories to user:", error);
      throw error;
    }
  },

  // שליפת קטגוריות של משתמש
  async findUserCategories(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT c.*
         FROM categories c
         JOIN UserCategories uc ON c.category_id = uc.category_id
         WHERE uc.user_id = ?`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving user categories:", error);
      throw error;
    }
  },

  // שליפת פרוספקטים לפי קטגוריה
  async findProspectsByCategory(categoryId) {
    try {
      const [rows] = await pool.query(
        `SELECT pr.*
         FROM Prospects pr
         JOIN ProspectCategories pc ON pr.prospect_id = pc.prospect_id
         WHERE pc.category_id = ?`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving prospects by category:", error);
      throw error;
    }
  },

  // שליפת משתמשים לפי קטגוריה כולל פרטי Person
  async findUsersByCategory(categoryId) {
    try {
      const [rows] = await pool.query(
        `SELECT u.user_id, u.email, u.role, u.person_id, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
         FROM users u
         JOIN UserCategories uc ON u.user_id = uc.user_id
         LEFT JOIN person p ON u.person_id = p.person_id
         WHERE uc.category_id = ?`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving users by category:", error);
      throw error;
    }
  },

  // שליפת מטופלים לפי קטגוריה כולל פרטי Person
  async findPatientsByCategory(categoryId) {
    try {
      const [rows] = await pool.query(
        `SELECT pat.patient_id, pat.user_id, pat.therapist_id, pat.status, pat.history_notes,
                u.email, u.role, u.person_id, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
         FROM patients pat
         JOIN PatientCategories pc ON pat.patient_id = pc.patient_id
         LEFT JOIN users u ON pat.user_id = u.user_id
         LEFT JOIN person p ON u.person_id = p.person_id
         WHERE pc.category_id = ?`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      logger.error("Error retrieving patients by category:", error);
      throw error;
    }
  }
};

export default CategoriesRepository;
