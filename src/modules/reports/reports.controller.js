import { getMonthlyTreatmentsReportService } from './reports.service.js';

// דוח טיפולים חודשיים לפי מטפל וארגון
export async function getMonthlyTreatmentsReportController(req, res) {
  try {
    const { therapist_id, organization_id, start_date, end_date } = req.body;
    if (!therapist_id || !organization_id || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'therapist_id, organization_id, start_date, and end_date are required' });
    }
    const report = await getMonthlyTreatmentsReportService({ therapist_id, organization_id, start_date, end_date });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
import { getMonthlyIncomeLast12Service } from './reports.service.js';

// דוח הכנסות 12 חודשים אחורה עד חודש ושנה
export async function getMonthlyIncomeLast12Controller(req, res) {
  try {
    const { year, month, organization_id } = req.body;
    if (typeof year !== 'number' || typeof month !== 'number' || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'year and month (1-12) are required' });
    }
    const result = await getMonthlyIncomeLast12Service({ year, month, organization_id });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
import { getIncomeReportByMonthsAndYearService } from './reports.service.js';

// דוח הכנסות לפי חודשים ושנה
export async function getIncomeReportByMonthsAndYearController(req, res) {
  try {
    const { year, months, organization_id, therapist_id } = req.body;
    if (typeof year !== 'number' || !Array.isArray(months) || months.length === 0 || months.some(m => typeof m !== 'number')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: year must be a number and months must be a non-empty array of numbers',
        received: req.body
      });
    }
    const report = await getIncomeReportByMonthsAndYearService({ year, months, organization_id, therapist_id });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
import { getOpenDebtsByTherapistService } from './reports.service.js';

// דוח חובות פתוחים למטפל
export async function getOpenDebtsByTherapistController(req, res) {
  try {
    const { therapist_id } = req.params;
    const debts = await getOpenDebtsByTherapistService(therapist_id);
    res.json({ success: true, data: debts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
import * as reportsService from './reports.service.js';

export async function createReportController(req, res) {
  try {
    const reportData = req.body;
    const newReport = await reportsService.createReportService(reportData);
    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllReportsController(req, res) {
  try {
    const reports = await reportsService.getAllReportsService();
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getReportByIdController(req, res) {
  try {
    const report = await reportsService.getReportByIdService(req.params.report_id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateReportController(req, res) {
  try {
    const updated = await reportsService.updateReportService(req.params.report_id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Report not found or no changes made' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteReportController(req, res) {
  try {
    const deleted = await reportsService.deleteReportService(req.params.report_id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
