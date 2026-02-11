import logger from "../../config/logger.js";
import pool from "../../services/database.js";

const CategoriesRepository = {
  // יצירת קטגוריה חדשה
  async create(categoryData, organizationId = null) {
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
         (category_type, category_name, description, color, icon, display_order, organization_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          category_type,
          category_name,
          description,
          color,
          icon,
          display_order,
          organizationId || null
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
  async findAll(organizationId = null) {
    try {
      let sql = `SELECT * FROM categories`;
      const params = [];
      
      if (organizationId) {
        sql += ' WHERE organization_id = ?';
        params.push(organizationId);
      }
      
      sql += ' ORDER BY display_order ASC';
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving categories:", error);
      throw error;
    }
  },

  // קבלת קטגוריות לפי type (לשימוש ב-service)
  async findByType(type, organizationId = null) {
    try {
      let sql = `SELECT * FROM categories WHERE category_type = ? AND (is_active IS NULL OR is_active = 1)`;
      const params = [type];
      
      if (organizationId) {
        sql += ' AND organization_id = ?';
        params.push(organizationId);
      }
      
      sql += ' ORDER BY display_order ASC';
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving categories by type:", error);
      throw error;
    }
  },

  // קבלת קטגוריה לפי ID
  async findById(id, organizationId = null) {
    try {
      let sql = `SELECT * FROM categories WHERE category_id = ?`;
      const params = [id];
      
      if (organizationId) {
        sql += ' AND organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
      return rows[0] || null;
    } catch (error) {
      logger.error("Error retrieving category by ID:", error);
      throw error;
    }
  },

  // עדכון קטגוריה
  async update(id, categoryData, organizationId = null) {
    try {
      const {
        description,
        color,
        icon,
        display_order,
        is_active
      } = categoryData;

      let sql = `UPDATE categories 
         SET description = ?, color = ?, icon = ?, display_order = ?, is_active = ?
         WHERE category_id = ?`;
      const params = [description, color, icon, display_order, is_active, id];
      
      if (organizationId) {
        sql += ' AND organization_id = ?';
        params.push(organizationId);
      }

      await pool.query(sql, params);

      return { success: true };
    } catch (error) {
      logger.error("Error updating category:", error);
      throw error;
    }
  },

  // סימון מחיקה רכה (soft delete)
  async softDelete(id, organizationId = null) {
    try {
      let sql = `UPDATE categories SET is_active = 0 WHERE category_id = ?`;
      const params = [id];
      
      if (organizationId) {
        sql += ' AND organization_id = ?';
        params.push(organizationId);
      }
      
      await pool.query(sql, params);
      return { success: true };
    } catch (error) {
      logger.error("Error soft deleting category:", error);
      throw error;
    }
  },

  // מחיקת קטגוריה
  async delete(id, organizationId = null) {
    try {
      let sql = `DELETE FROM categories WHERE category_id = ?`;
      const params = [id];
      
      if (organizationId) {
        sql += ' AND organization_id = ?';
        params.push(organizationId);
      }
      
      await pool.query(sql, params);

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
  async findProspectCategories(prospectId, organizationId = null) {
    try {
      let sql = `SELECT c.*
         FROM categories c
         JOIN prospect_categories pc ON c.category_id = pc.category_id
         WHERE pc.prospect_id = ?`;
      const params = [prospectId];
      
      if (organizationId) {
        sql += ' AND c.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
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
  async findPatientCategories(patientId, organizationId = null) {
    try {
      let sql = `SELECT c.*
         FROM categories c
         JOIN patientcategories pc ON c.category_id = pc.category_id
         WHERE pc.patient_id = ?`;
      const params = [patientId];
      
      if (organizationId) {
        sql += ' AND c.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
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
  async findUserCategories(userId, organizationId = null) {
    try {
      let sql = `SELECT c.*
         FROM categories c
         JOIN UserCategories uc ON c.category_id = uc.category_id
         WHERE uc.user_id = ?`;
      const params = [userId];
      
      if (organizationId) {
        sql += ' AND c.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving user categories:", error);
      throw error;
    }
  },

  // שליפת פרוספקטים לפי קטגוריה
  async findProspectsByCategory(categoryId, options = {}, organizationId = null) {
    try {
      let sql = `SELECT pr.*
         FROM Prospects pr
         JOIN ProspectCategories pc ON pr.prospect_id = pc.prospect_id
         WHERE pc.category_id = ?`;
      const params = [categoryId];
      
      if (organizationId) {
        sql += ' AND pr.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving prospects by category:", error);
      throw error;
    }
  },

  // שליפת משתמשים לפי קטגוריה כולל פרטי Person
  async findUsersByCategory(categoryId, options = {}, organizationId = null) {
    try {
      let sql = `SELECT u.user_id, u.email, u.role, u.person_id, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
         FROM users u
         JOIN UserCategories uc ON u.user_id = uc.user_id
         LEFT JOIN person p ON u.person_id = p.person_id
         WHERE uc.category_id = ?`;
      const params = [categoryId];
      
      if (organizationId) {
        sql += ' AND u.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving users by category:", error);
      throw error;
    }
  },

  // שליפת מטופלים לפי קטגוריה כולל פרטי Person
  async findPatientsByCategory(categoryId, options = {}, organizationId = null) {
    try {
      let sql = `SELECT pat.patient_id, pat.user_id, pat.therapist_id, pat.status, pat.history_notes,
                u.email, u.role, u.person_id, p.first_name, p.last_name, p.phone, p.teudat_zehut, p.city, p.address, p.birth_date, p.gender
         FROM patients pat
         JOIN PatientCategories pc ON pat.patient_id = pc.patient_id
         LEFT JOIN users u ON pat.user_id = u.user_id
         LEFT JOIN person p ON u.person_id = p.person_id
         WHERE pc.category_id = ?`;
      const params = [categoryId];
      
      if (organizationId) {
        sql += ' AND pat.organization_id = ?';
        params.push(organizationId);
      }
      
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      logger.error("Error retrieving patients by category:", error);
      throw error;
    }
  }
};

export default CategoriesRepository;
