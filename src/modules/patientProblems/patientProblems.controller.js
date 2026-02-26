import { deleteProblemRatingByRatingIdService } from './patientProblems.service.js';

// מחיקת דירוג מסוים מתוך בעיה מסוימת
export async function deleteProblemRatingByRatingId(req, res) {
    try {
        const { patient_problem_rating_id } = req.params;
        await deleteProblemRatingByRatingIdService(patient_problem_rating_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

import { getProblemRatingsByProblemIdService } from './patientProblems.service.js';

// קבלת דירוגים לפי מזהה בעיה
export async function getProblemRatingsByProblemId(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const ratings = await getProblemRatingsByProblemIdService(patient_problem_id);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import { getAllProblemRatingsService } from './patientProblems.service.js';

// קבלת כל הדירוגים לכל הבעיות
export async function getAllProblemRatings(req, res) {
    try {
        const ratings = await getAllProblemRatingsService();
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import {
    getRatingsByProblemIdService,
    addProblemRatingService,
    deleteProblemRatingService
} from './patientProblems.service.js';

// קבלת דירוגים לפי מזהה בעיה
export async function getRatingsByProblemId(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const ratings = await getRatingsByProblemIdService(patient_problem_id);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// הוספת דירוג לבעיה
export async function addProblemRating(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const { rating_date, score, notes, organization_id: orgFromBody } = req.body;
        const organization_id = req.organization_id || orgFromBody;
        // console.log('[addProblemRating] req.params:', req.params);
        // console.log('[addProblemRating] req.body:', req.body);
        const rating = await addProblemRatingService({
            patient_problem_id,
            rating_date,
            score,
            notes,
            organization_id
        });
        // console.log('[addProblemRating] rating:', rating);
        res.status(201).json(rating);
    } catch (err) {
        console.error('[addProblemRating] error:', err);
        res.status(500).json({ error: err.message });
    }
}

// מחיקת דירוג
export async function deleteProblemRating(req, res) {
    try {
        const { patient_problem_rating_id } = req.params;
        await deleteProblemRatingService(patient_problem_rating_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import * as patientProblemModel from './patientProblem.model.js';

export async function createPatientProblem(req, res) {
    try {
        const organizationId = req.organization_id;
        const problem = await patientProblemModel.createPatientProblem(req.body, organizationId);
        res.status(201).json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getPatientProblemsByPatient(req, res) {
    try {
        const { patient_id } = req.params;
        const organizationId = req.organization_id;
        const problems = await patientProblemModel.getPatientProblemsByPatient(patient_id, organizationId);
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getPatientProblemById(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const problem = await patientProblemModel.getPatientProblemById(patient_problem_id);
        if (!problem) return res.status(404).json({ error: 'Not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updatePatientProblem(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const organizationId = req.organization_id;
        const updated = await patientProblemModel.updatePatientProblem(patient_problem_id, req.body, organizationId);
        if (!updated) {
            return res.status(404).json({ error: 'Not found or no changes' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deletePatientProblem(req, res) {
    try {
        const { patient_problem_id } = req.params;
        const organizationId = req.organization_id;
        // console.log(`[deletePatientProblem] מחיקת בעיה: patient_problem_id=${patient_problem_id}`);
        await patientProblemModel.deletePatientProblem(patient_problem_id, organizationId);
        // console.log(`[deletePatientProblem] בעיה נמחקה בהצלחה: patient_problem_id=${patient_problem_id}`);
        res.json({ success: true });
    } catch (err) {
        console.error(`[deletePatientProblem] שגיאה במחיקת בעיה:`, err);
        res.status(500).json({ error: err.message });
    }
}
