import { 
  create, 
  getTherapists,
  deleteFromTherapists,
  updateToTherapists 
} from "./therapists.repo.js";
import pool from "../../services/database.js";

export async function createTherapist(therapistData) {
  console.log("In therapists.service.js - createTherapist function");
  try {
    // therapistData: { user: {...}, therapist: {...} }
    const newTherapist = await create(therapistData);

    // שיוך למחלקה אם נבחרה
    if (therapistData.user && therapistData.user.department_id) {
      const sql = `INSERT INTO UserDepartments (user_id, department_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)`;
      await pool.query(sql, [newTherapist.user_id, therapistData.user.department_id]);
    }

    // שיוך לקבוצות אם נבחרו
    if (therapistData.user && Array.isArray(therapistData.user.group_ids) && therapistData.user.group_ids.length > 0) {
      for (const groupId of therapistData.user.group_ids) {
        const sql = `INSERT INTO UserGroups (user_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = VALUES(group_id)`;
        await pool.query(sql, [newTherapist.user_id, groupId]);
      }
    }

    return newTherapist;
  } catch (error) {
    throw error;
  }
}

export const fetchTherapists = async () => {
  console.log("In therapists.service.js - fetchTherapists function");
    const therapists = await getTherapists();
    return therapists;
};


export async function updateTherapist(id, updateData) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM Therapists WHERE therapist_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await updateToTherapists(id, updateData);
  } catch (error) {
    throw error;
  }
}