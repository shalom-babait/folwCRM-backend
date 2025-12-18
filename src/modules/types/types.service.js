import { create, deleteFromTypes, getTypes, updateToTypes } from "./types.repo.js";
import pool from "../../services/database.js";

export const fetchTypes = async (patientId) => {
  try {
    if (!patientId || isNaN(patientId)) {
      throw new Error('Missing or invalid patientId');
    }
    const types = await getTypes(Number(patientId));
    return types;
  } catch (error) {
    throw error;
  }
};

export async function createType(typeData) {
    try {
        const newType = await create(typeData);
        return newType;
    } catch (error) {
        throw error;
    }
}

export async function deleteType(id) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM treatment_types WHERE treatment_type_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await deleteFromTypes(id);
  } catch (error) {
    throw error;
  }
}

export async function updateType(id, updateData) {
  try {
    const [existing] = await pool.execute(
      "SELECT * FROM treatment_types WHERE treatment_type_id = ?",
      [id]
    );
    if (existing.length === 0) {
      return false;
    }
    return await updateToTypes(id, updateData);
  } catch (error) {
    throw error;
  }
}