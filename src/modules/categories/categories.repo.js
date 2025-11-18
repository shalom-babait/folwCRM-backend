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
        `INSERT INTO Categories
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
        `SELECT * FROM Categories ORDER BY display_order ASC`
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
        `SELECT * FROM Categories WHERE category_type = ? AND (is_active IS NULL OR is_active = 1) ORDER BY display_order ASC`,
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
        `SELECT * FROM Categories WHERE category_id = ?`,
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
        `UPDATE Categories 
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
        `UPDATE Categories SET is_active = 0 WHERE category_id = ?`,
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
        `DELETE FROM Categories WHERE category_id = ?`,
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
      await pool.query(
        `DELETE FROM Prospect_Categories WHERE prospect_id = ?`,
        [prospectId]
      );

      if (categoryIds.length > 0) {
        const values = categoryIds.map(id => [prospectId, id]);
        await pool.query(
          `INSERT INTO Prospect_Categories (prospect_id, category_id) VALUES ?`,
          [values]
        );
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
         FROM Categories c
         JOIN Prospect_Categories pc ON c.category_id = pc.category_id
         WHERE pc.prospect_id = ?`,
        [prospectId]
      );

      return rows;
    } catch (error) {
      logger.error("Error retrieving prospect categories:", error);
      throw error;
    }
  }
};

export default CategoriesRepository;
