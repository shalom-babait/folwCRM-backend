import express from 'express';
import * as patientProblemsController from './patientProblems.controller.js';

const router = express.Router();

router.post('/add', patientProblemsController.createPatientProblem);
router.get('/by-patient/:patient_id', patientProblemsController.getPatientProblemsByPatient);
router.get('/:patient_problem_id', patientProblemsController.getPatientProblemById);
router.put('/:patient_problem_id', patientProblemsController.updatePatientProblem);
router.delete('/:patient_problem_id', patientProblemsController.deletePatientProblem);
// דירוגים לבעיה
router.get('/:patient_problem_id/problem-ratings', patientProblemsController.getRatingsByProblemId);
router.post('/:patient_problem_id/problem-ratings', patientProblemsController.addProblemRating);
router.delete('/problem-ratings/:patient_problem_rating_id', patientProblemsController.deleteProblemRating);
router.get('/all-problem-ratings', patientProblemsController.getAllProblemRatings);// כל הדירוגים לכל הבעיות
router.get('/:patient_problem_id/problem-ratings-list', patientProblemsController.getProblemRatingsByProblemId);// דירוגים לפי מזהה בעיה



export default router;
