import { getOpenDebtsByTherapist } from './reports.repo.js';

export async function getOpenDebtsByTherapistService(therapist_id) {
  return await getOpenDebtsByTherapist(therapist_id);
}
import * as reportsRepo from './reports.repo.js';

export async function createReportService(reportData) {
  return await reportsRepo.createReport(reportData);
}

export async function getAllReportsService() {
  return await reportsRepo.getAllReports();
}

export async function getReportByIdService(report_id) {
  return await reportsRepo.getReportById(report_id);
}

export async function updateReportService(report_id, reportData) {
  return await reportsRepo.updateReport(report_id, reportData);
}

export async function deleteReportService(report_id) {
  return await reportsRepo.deleteReport(report_id);
}
