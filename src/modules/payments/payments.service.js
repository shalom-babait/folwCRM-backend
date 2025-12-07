import * as paymentsRepo from './payments.repo.js';

export async function createPaymentService(paymentData) {
  return await paymentsRepo.createPayment(paymentData);
}

export async function getAllPaymentsService() {
  return await paymentsRepo.getAllPayments();
}

export async function getPaymentByIdService(pay_id) {
  return await paymentsRepo.getPaymentById(pay_id);
}

export async function getPaymentByPatientIdService(patient_id) {
  return await paymentsRepo.getPaymentByPatientId(patient_id);
}


export async function updatePaymentService(pay_id, paymentData) {
  return await paymentsRepo.updatePayment(pay_id, paymentData);
}

export async function deletePaymentService(pay_id) {
  return await paymentsRepo.deletePayment(pay_id);
}
