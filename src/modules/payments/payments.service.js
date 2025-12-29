import * as paymentsRepo from './payments.repo.js';

export async function createPaymentService(paymentData) {
  return await paymentsRepo.createPayment(paymentData);
}

export async function getAllPaymentsService() {
  return await paymentsRepo.getAllPayments();
}

export async function getPaymentByIdService(payment_id) {
  return await paymentsRepo.getPaymentById(payment_id);
}

export async function getPaymentByPatientIdService(patient_id) {
  return await paymentsRepo.getPaymentByPatientId(patient_id);
}

export async function updatePaymentService(payment_id, paymentData) {
  return await paymentsRepo.updatePayment(payment_id, paymentData);
}

export async function deletePaymentService(payment_id) {
  return await paymentsRepo.deletePayment(payment_id);
}

export async function deletePaymentByIdService(payment_id) {
  return await paymentsRepo.deletePaymentById(payment_id);
}

export async function getTherapistMonthlyPaymentsListService(therapistId) {
  return await paymentsRepo.getTherapistMonthlyPaymentsList(therapistId);
}
