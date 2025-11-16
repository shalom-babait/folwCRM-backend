import { 
  create, 
  getTherapists,
  updateToTherapists 
} from "./therapists.repo.js";
import pool from "../../services/database.js";

export async function createTherapist(therapistData) {
  try {
    // therapistData: { user: {...}, therapist: {...} }
    const newTherapist = await create(therapistData);


    // שיוך למחלקות ולקבוצות לפי selectedDepartments
    if (Array.isArray(therapistData.selectedDepartments)) {
      for (const dep of therapistData.selectedDepartments) {
        // שיוך למחלקה
        const depSql = `INSERT INTO UserDepartments (user_id, department_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_id = VALUES(department_id)`;
        await pool.query(depSql, [newTherapist.user_id, dep.department_id]);

        // שיוך לקבוצות במחלקה
        if (Array.isArray(dep.group_ids)) {
          for (const groupId of dep.group_ids) {
            const groupSql = `INSERT INTO UserGroups (user_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = VALUES(group_id)`;
            await pool.query(groupSql, [newTherapist.user_id, groupId]);
          }
        }
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