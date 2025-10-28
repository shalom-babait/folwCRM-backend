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
    return newTherapist;
  } catch (error) {
    throw error;
  }
}

export const fetchTherapists = async () => {
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