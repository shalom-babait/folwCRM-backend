import { create, getTherapists } from "./therapists.repo.js";
import pool from "../../services/database.js";

export async function createTherapist(therapistData) {
  try {
    // בדיקה שהמשתמש עדיין לא רשום כמטפל
    const [existingTherapist] = await pool.execute(
      "SELECT * FROM Therapists WHERE user_id = ?", 
      [therapistData.user_id]
    );
    
    if (existingTherapist.length > 0) {
      throw new Error("User is already registered as therapist");
    }

    const newTherapist = await create(therapistData);
    return newTherapist;
  } catch (error) {
    throw error;
  }
}

export const fetchTherapists = async () => {
    const therapists = await getTherapists();
    return therapists;
};