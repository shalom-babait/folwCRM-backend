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
