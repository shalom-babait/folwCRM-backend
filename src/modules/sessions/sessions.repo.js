import pool, { updateTable } from "../../services/database.js";

export async function findSessionById(appointmentId) {
  const sql = `
    SELECT *
    FROM appointments
    WHERE appointment_id = ?
  `;

  const [rows] = await pool.execute(sql, [appointmentId]);
  return rows;
}

export async function updateNotesInSessions(appointmentId, notes) {

  const where = {
    appointment_id: appointmentId
  };

  return updateTable("appointments", { notes }, where);
}