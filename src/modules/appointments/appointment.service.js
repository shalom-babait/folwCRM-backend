import { getAppointmentsByPatientAndTherapist } from "./appointment.repo.js";

export async function fetchAppointments(patientId, therapistId) {
  return await getAppointmentsByPatientAndTherapist(patientId, therapistId);
}
