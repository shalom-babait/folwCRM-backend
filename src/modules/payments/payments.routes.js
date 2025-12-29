import express from 'express';
import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
  getAllPatientPaymentsController,
  deletePaymentByIdController,
  getTherapistMonthlyPaymentsListController
} from './payments.controller.js';

const router = express.Router();

router.post('/create', createPaymentController);
router.get('/getAll', getAllPaymentsController);
router.get('/:payment_id', getPaymentByIdController);
router.put('/update/:payment_id', updatePaymentController);
router.delete('/delete/:payment_id', deletePaymentController);
router.get('/getAllPatientPayments/:patient_id', getAllPatientPaymentsController);
// מחיקת תשלום לפי מזהה
router.delete('/deleteById/:payment_id', deletePaymentByIdController);
// רשימת תשלומים לפי מטפל לחודש הנוכחי
router.get('/monthly-list/:therapist_id', getTherapistMonthlyPaymentsListController);

export default router;
