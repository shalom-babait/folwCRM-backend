import * as paymentsService from './payments.service.js';

// --- יצירת תשלום ---
export async function createPaymentController(req, res) {
  try {
    const payment = await paymentsService.createPaymentService(req.body);
    res.status(201).json(payment);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה של כל התשלומים ---
export async function getAllPaymentsController(req, res) {
  try {
    const payments = await paymentsService.getAllPaymentsService();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה לפי תשלום ID ---
export async function getPaymentByIdController(req, res) {
  try {
    const payment = await paymentsService.getPaymentByIdService(req.params.payment_id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- עדכון תשלום ---
export async function updatePaymentController(req, res) {
  try {
    const updated = await paymentsService.updatePaymentService(
      req.params.payment_id,
      req.body
    );
    res.json(updated);
  } catch (err) {
    console.error('SQL ERROR:', err);  
    res.status(500).json({ error: err.message });
  }
}


// --- מחיקת תשלום ---
export async function deletePaymentController(req, res) {
  try {
    await paymentsService.deletePaymentService(req.params.payment_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- מחיקת תשלום לפי מזהה ---
export async function deletePaymentByIdController(req, res) {
  try {
    await paymentsService.deletePaymentByIdService(req.params.payment_id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה לפי patient_id ---
export async function getAllPatientPaymentsController(req, res) {
  try {
    const payments = await paymentsService.getPaymentByPatientIdService(req.params.patient_id);
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- רשימת תשלומים לפי מטפל לחודש הנוכחי ---
export async function getTherapistMonthlyPaymentsListController(req, res) {
  try {
    const therapistId = req.params.therapist_id;
    const paymentsList = await paymentsService.getTherapistMonthlyPaymentsListService(therapistId);
    res.json(paymentsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
