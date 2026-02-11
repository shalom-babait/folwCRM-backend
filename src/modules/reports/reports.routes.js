import { getMonthlyIncomeLast12Controller } from './reports.controller.js';
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
// דוח הכנסות 12 חודשים אחורה עד חודש ושנה
router.post('/income-last-12', getMonthlyIncomeLast12Controller);
router.post('/create', createReportController);
router.get('/getAll', getAllReportsController);
router.get('/:report_id', getReportByIdController);
router.put('/update/:report_id', updateReportController);
router.delete('/delete/:report_id', deleteReportController);

export default router;
