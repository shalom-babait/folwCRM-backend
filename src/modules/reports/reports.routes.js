
import express from 'express';
import {
  getMonthlyTreatmentsReportController,
  getMonthlyIncomeLast12Controller,
  getIncomeReportByMonthsAndYearController,
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  getOpenDebtsByTherapistController
} from './reports.controller.js';


const router = express.Router();


// דוח טיפולים חודשיים לפי מטפל וארגון
router.post('/monthly-treatments', getMonthlyTreatmentsReportController);
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
