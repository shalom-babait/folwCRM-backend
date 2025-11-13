// src/modules/categories/categories.repo.js
import pool from '../../services/database.js';

class CategoriesRepo {
  // ========== Categories Table ==========
  
  async findAll() {
    const [rows] = await pool.query(
      'SELECT * FROM Categories WHERE is_active = 1 ORDER BY display_order'
    );
    return rows;
  }

  async findByType(type) {
    const [rows] = await pool.query(
      'SELECT * FROM Categories WHERE category_type = ? AND is_active = 1 ORDER BY display_order',
      [type]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM Categories WHERE category_id = ?',
      [id]
    );
    return rows[0];
  }

  async create(categoryData) {
    const { category_type, category_name, category_label, description, color, icon, display_order } = categoryData;
    const [result] = await pool.query(
      `INSERT INTO Categories 
       (category_type, category_name, category_label, description, color, icon, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_type, category_name, category_label, description, color, icon, display_order]
    );
    return result.insertId;
  }

  async update(id, categoryData) {
    const { category_label, description, color, icon, display_order, is_active } = categoryData;
    await pool.query(
      `UPDATE Categories 
       SET category_label = ?, description = ?, color = ?, icon = ?, display_order = ?, is_active = ?
       WHERE category_id = ?`,
      [category_label, description, color, icon, display_order, is_active, id]
    );
  }

  async delete(id) {
    await pool.query('DELETE FROM Categories WHERE category_id = ?', [id]);
  }

  async softDelete(id) {
    await pool.query('UPDATE Categories SET is_active = 0 WHERE category_id = ?', [id]);
  }

  // ========== ProspectCategories ==========
  
  async assignToProspect(prospectId, categoryId, assignedBy = null) {
    const [result] = await pool.query(
      'INSERT INTO ProspectCategories (prospect_id, category_id, assigned_by) VALUES (?, ?, ?)',
      [prospectId, categoryId, assignedBy]
    );
    return result.insertId;
  }

  async removeFromProspect(prospectId, categoryId) {
    await pool.query(
      'DELETE FROM ProspectCategories WHERE prospect_id = ? AND category_id = ?',
      [prospectId, categoryId]
    );
  }

  async findProspectCategories(prospectId) {
    const [rows] = await pool.query(
      `SELECT c.*, pc.assigned_at, pc.assigned_by, u.first_name, u.last_name
       FROM Categories c
       JOIN ProspectCategories pc ON c.category_id = pc.category_id
       LEFT JOIN Users u ON pc.assigned_by = u.user_id
       WHERE pc.prospect_id = ?
       ORDER BY c.display_order`,
      [prospectId]
    );
    return rows;
  }

  async findProspectsByCategory(categoryId) {
    const [rows] = await pool.query(
      `SELECT p.*, pc.assigned_at
       FROM Prospects p
       JOIN ProspectCategories pc ON p.prospect_id = pc.prospect_id
       WHERE pc.category_id = ?
       ORDER BY pc.assigned_at DESC`,
      [categoryId]
    );
    return rows;
  }

  // ========== PatientCategories ==========
  
  async assignToPatient(patientId, categoryId, assignedBy = null) {
    const [result] = await pool.query(
      'INSERT INTO PatientCategories (patient_id, category_id, assigned_by) VALUES (?, ?, ?)',
      [patientId, categoryId, assignedBy]
    );
    return result.insertId;
  }

  async removeFromPatient(patientId, categoryId) {
    await pool.query(
      'DELETE FROM PatientCategories WHERE patient_id = ? AND category_id = ?',
      [patientId, categoryId]
    );
  }

  async findPatientCategories(patientId) {
    const [rows] = await pool.query(
      `SELECT c.*, pc.assigned_at, pc.assigned_by
       FROM Categories c
       JOIN PatientCategories pc ON c.category_id = pc.category_id
       WHERE pc.patient_id = ?
       ORDER BY c.display_order`,
      [patientId]
    );
    return rows;
  }

  // ========== UserCategories ==========
  
  async assignToUser(userId, categoryId) {
    const [result] = await pool.query(
      'INSERT INTO UserCategories (user_id, category_id) VALUES (?, ?)',
      [userId, categoryId]
    );
    return result.insertId;
  }

  async removeFromUser(userId, categoryId) {
    await pool.query(
      'DELETE FROM UserCategories WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );
  }

  async findUserCategories(userId) {
    const [rows] = await pool.query(
      `SELECT c.*, uc.assigned_at
       FROM Categories c
       JOIN UserCategories uc ON c.category_id = uc.category_id
       WHERE uc.user_id = ?
       ORDER BY c.display_order`,
      [userId]
    );
    return rows;
  }
}

export default new CategoriesRepo();