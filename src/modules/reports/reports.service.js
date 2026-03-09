import { getMonthlyTreatmentsReport } from './reports.repo.js';

export async function getMonthlyTreatmentsReportService(data) {
  return await getMonthlyTreatmentsReport(data);
}
import { getMonthlyIncomeLast12 } from './reports.repo.js';

export async function getMonthlyIncomeLast12Service(data) {
  return await getMonthlyIncomeLast12(data);
}
import { getIncomeReportByMonthsAndYear } from './reports.repo.js';

export async function getIncomeReportByMonthsAndYearService(data) {
  return await getIncomeReportByMonthsAndYear(data);
}
import { getOpenDebtsByTherapist } from './reports.repo.js';

export async function getOpenDebtsByTherapistService(therapist_id, organization_id) {
  return await getOpenDebtsByTherapist(therapist_id, organization_id);
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
