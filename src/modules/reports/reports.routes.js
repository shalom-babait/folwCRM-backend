import { getIncomeReportByMonthsAndYearController } from './reports.controller.js';
import express from 'express';
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  getOpenDebtsByTherapistController
} from './reports.controller.js';

const router = express.Router();

// דוח חובות פתוחים למטפל
router.get('/open-debts/:therapist_id', getOpenDebtsByTherapistController);
// דוח הכנסות לפי חודשים ושנה
router.post('/income-by-months', getIncomeReportByMonthsAndYearController);
router.post('/create', createReportController);
router.get('/getAll', getAllReportsController);
router.get('/:report_id', getReportByIdController);
router.put('/update/:report_id', updateReportController);
router.delete('/delete/:report_id', deleteReportController);

export default router;
