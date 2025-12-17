import express from 'express';
import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
  getAllPatientPaymentsController
} from './payments.controller.js';

const router = express.Router();

router.post('/create', createPaymentController);
router.get('/getAll', getAllPaymentsController);
router.get('/:payment_id', getPaymentByIdController);
router.put('/update/:payment_id', updatePaymentController);
router.delete('/delete/:payment_id', deletePaymentController);
router.get('/getAllPatientPayments/:patient_id', getAllPatientPaymentsController);

export default router;
