import pool from '../../services/database.js';

export async function createPerson(personData, organizationId = null) {
  const { first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender, email } = personData;
  try {
    const [result] = await pool.query(
      `INSERT INTO person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender, email, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender || 'other', email || null, organizationId || null]
    );
    return { person_id: result.insertId, ...personData };
  } catch (error) {
    throw error;
  }
}

export async function getAllPersons(organizationId = null) {
  try {
    let sql = `SELECT * FROM person`;
    const params = [];
    
    if (organizationId) {
      sql += ' WHERE organization_id = ?';
      params.push(organizationId);
    }
    
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function getPersonById(person_id, organizationId = null) {
  try {
    let sql = `SELECT * FROM person WHERE person_id = ?`;
    const params = [person_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function updatePerson(person_id, personData, organizationId = null) {
  try {
    const fields = Object.keys(personData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(personData);
    
    let sql = `UPDATE person SET ${fields} WHERE person_id = ?`;
    const params = [...values, person_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return null;
    return getPersonById(person_id, organizationId);
  } catch (error) {
    throw error;
  }
}

export async function deletePerson(person_id, organizationId = null) {
  try {
    let sql = `DELETE FROM person WHERE person_id = ?`;
    const params = [person_id];
    
    if (organizationId) {
      sql += ' AND organization_id = ?';
      params.push(organizationId);
    }
    
    const [result] = await pool.query(sql, params);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}
