import * as paymentsService from './payments.service.js';

export async function createPaymentController(req, res) {
  try {
    const payment = await paymentsService.createPaymentService(req.body);
    res.status(201).json(payment);
  } catch (err) {
    console.error(" SERVER ERROR:", err);   
    res.status(500).json({ error: err.message });
  }
}


export async function getAllPaymentsController(req, res) {
  try {
    const payments = await paymentsService.getAllPaymentsService();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPaymentByIdController(req, res) {
  try {
    const payment = await paymentsService.getPaymentByIdService(req.params.pay_id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePaymentController(req, res) {
  try {
    const updated = await paymentsService.updatePaymentService(req.params.pay_id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePaymentController(req, res) {
  try {
    await paymentsService.deletePaymentService(req.params.pay_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function getAllPatientPaymentsController(req, res) {
  try {
    const payments = await paymentsService.getPaymentByPatientIdService(req.params.patient_id);

    res.status(200).json(payments);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
