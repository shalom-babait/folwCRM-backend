import * as paymentsRepo from './payments.repo.js';

export async function createPaymentService(paymentData) {
  return await paymentsRepo.createPayment(paymentData);
}

export async function getAllPaymentsService(organizationId = null) {
  return await paymentsRepo.getAllPayments(organizationId);
}

export async function getPaymentByIdService(payment_id, organizationId = null) {
  return await paymentsRepo.getPaymentById(payment_id, organizationId);
}

export async function getPaymentByPatientIdService(patient_id, organizationId = null) {
  return await paymentsRepo.getPaymentByPatientId(patient_id, organizationId);
}

export async function updatePaymentService(payment_id, paymentData, organizationId = null) {
  return await paymentsRepo.updatePayment(payment_id, paymentData, organizationId);
}

export async function deletePaymentService(payment_id, organizationId = null) {
  return await paymentsRepo.deletePayment(payment_id, organizationId);
}

export async function deletePaymentByIdService(payment_id, organizationId = null) {
  return await paymentsRepo.deletePaymentById(payment_id, organizationId);
}

export async function getTherapistMonthlyPaymentsListService(therapistId, organizationId = null) {
  return await paymentsRepo.getTherapistMonthlyPaymentsList(therapistId, organizationId);
}
