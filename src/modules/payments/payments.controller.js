import * as paymentsService from './payments.service.js';

// --- יצירת תשלום ---
export async function createPaymentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const paymentData = {
      ...req.body,
      organization_id: organizationId
    };
    const payment = await paymentsService.createPaymentService(paymentData);
    res.status(201).json(payment);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה של כל התשלומים ---
export async function getAllPaymentsController(req, res) {
  try {
    const organizationId = req.organization_id;
    const payments = await paymentsService.getAllPaymentsService(organizationId);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה לפי תשלום ID ---
export async function getPaymentByIdController(req, res) {
  try {
    const organizationId = req.organization_id;
    const payment = await paymentsService.getPaymentByIdService(req.params.payment_id, organizationId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- עדכון תשלום ---
export async function updatePaymentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const updated = await paymentsService.updatePaymentService(
      req.params.payment_id,
      req.body,
      organizationId
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
    const organizationId = req.organization_id;
    await paymentsService.deletePaymentService(req.params.payment_id, organizationId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- מחיקת תשלום לפי מזהה ---
export async function deletePaymentByIdController(req, res) {
  try {
    const organizationId = req.organization_id;
    await paymentsService.deletePaymentByIdService(req.params.payment_id, organizationId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- שליפה לפי patient_id ---
export async function getAllPatientPaymentsController(req, res) {
  try {
    const organizationId = req.organization_id;
    const payments = await paymentsService.getPaymentByPatientIdService(req.params.patient_id, organizationId);
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- רשימת תשלומים לפי מטפל לחודש הנוכחי ---
export async function getTherapistMonthlyPaymentsListController(req, res) {
  try {
    const therapistId = req.params.therapist_id;
    const organizationId = req.organization_id;
    const paymentsList = await paymentsService.getTherapistMonthlyPaymentsListService(therapistId, organizationId);
    res.json(paymentsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- שליפת תנועות כספיות משולבות לפי חודש ---
export async function getFinancialTransactionsByMonthController(req, res) {
  try {
    const therapistId = req.params.therapist_id;
    const { month, year } = req.query;
    const organizationId = req.organization_id;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }
    
    const data = await paymentsService.getFinancialTransactionsByMonthService(
      therapistId, 
      parseInt(month), 
      parseInt(year), 
      organizationId
    );
    
    res.json(data);
  } catch (err) {
    console.error('Error in getFinancialTransactionsByMonthController:', err);
    res.status(500).json({ error: err.message });
  }
}
