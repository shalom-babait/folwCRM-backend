import { findSessionById, updateNotesInSessions } from "./sessions.repo.js";

export async function updateSessionNotes(appointmentId, notes) {

  const existing = await findSessionById(appointmentId);

  if (!existing || existing.length === 0) {
    return false;
  }

  return await updateNotesInSessions(appointmentId, notes);
}