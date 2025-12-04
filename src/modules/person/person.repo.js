import pool from '../../services/database.js';

export async function createPerson(personData) {
  const { first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender } = personData;
  try {
    const [result] = await pool.query(
      `INSERT INTO Person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender || 'other']
    );
    return { person_id: result.insertId, ...personData };
  } catch (error) {
    throw error;
  }
}

export async function getAllPersons() {
  try {
    const [rows] = await pool.query(`SELECT * FROM Person`);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function getPersonById(person_id) {
  try {
    const [rows] = await pool.query(`SELECT * FROM Person WHERE person_id = ?`, [person_id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function updatePerson(person_id, personData) {
  try {
    const fields = Object.keys(personData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(personData);
    const [result] = await pool.query(`UPDATE Person SET ${fields} WHERE person_id = ?`, [...values, person_id]);
    if (result.affectedRows === 0) return null;
    return getPersonById(person_id);
  } catch (error) {
    throw error;
  }
}

export async function deletePerson(person_id) {
  try {
    const [result] = await pool.query(`DELETE FROM Person WHERE person_id = ?`, [person_id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}
