import express from 'express';
import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController
} from './payments.controller.js';

const router = express.Router();

router.post('/create', createPaymentController);
router.get('/getAll', getAllPaymentsController);
router.get('/:pay_id', getPaymentByIdController);
router.put('/update/:pay_id', updatePaymentController);
router.delete('/delete/:pay_id', deletePaymentController);

export default router;
