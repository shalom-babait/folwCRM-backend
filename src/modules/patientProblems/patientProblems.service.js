export async function deleteProblemRatingByRatingIdService(patient_problem_rating_id) {
    return await deleteProblemRating(patient_problem_rating_id);
}
import {
    getRatingsByProblemId,
    addProblemRating,
    deleteProblemRating,
    getAllProblemRatings,
    getProblemRatingsByProblemId,
} from './patientProblem.model.js';

export async function getProblemRatingsByProblemIdService(patient_problem_id) {
    return await getProblemRatingsByProblemId(patient_problem_id);
}

export async function getAllProblemRatingsService() {
    return await getAllProblemRatings();
}
export async function getRatingsByProblemIdService(patient_problem_id) {
    return await getRatingsByProblemId(patient_problem_id);
}

export async function addProblemRatingService(data) {
    return await addProblemRating(data);
}

export async function deleteProblemRatingService(patient_problem_rating_id) {
    return await deleteProblemRating(patient_problem_rating_id);
}
import * as patientProblemModel from './patientProblem.model.js';

export async function createPatientProblemService(data) {
    return await patientProblemModel.createPatientProblem(data);
}

export async function getPatientProblemsByPatientService(patient_id) {
    return await patientProblemModel.getPatientProblemsByPatient(patient_id);
}

export async function getPatientProblemByIdService(patient_problem_id) {
    return await patientProblemModel.getPatientProblemById(patient_problem_id);
}

export async function updatePatientProblemService(patient_problem_id, updateData) {
    return await patientProblemModel.updatePatientProblem(patient_problem_id, updateData);
}

export async function deletePatientProblemService(patient_problem_id) {
    return await patientProblemModel.deletePatientProblem(patient_problem_id);
}
