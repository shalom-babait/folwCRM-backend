import { getUpcomingFollowUpsByCreator as getUpcomingFollowUpsByCreatorModel } from './followUp.model.js';

export async function getUpcomingFollowUpsByCreator(req, res) {
    try {
        const { created_by_person_id } = req.params;
        const followUps = await getUpcomingFollowUpsByCreatorModel(created_by_person_id);
        res.json(followUps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import * as followUpModel from './followUp.model.js';

export async function createFollowUp(req, res) {
    try {
        console.log('Request Body:', req.body); // לוג של גוף הבקשה
        // ודא שמעבירים גם created_by_person_id
        const followUp = await followUpModel.createFollowUp(req.body);
        res.status(201).json(followUp);
    } catch (err) {
        console.error('Error creating follow up:', err);
        if (err.sqlMessage) {
            console.error('SQL Error:', err.sqlMessage);
        }
        res.status(500).json({ error: err.message, sql: err.sqlMessage });
    }
}

export async function getFollowUpsByPerson(req, res) {
    try {
        const { person_id } = req.params;
        const followUps = await followUpModel.getFollowUpsByPerson(person_id);
        res.json(followUps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getFollowUpById(req, res) {
    try {
        const { followup_id } = req.params;
        const followUp = await followUpModel.getFollowUpById(followup_id);
        if (!followUp) return res.status(404).json({ error: 'Not found' });
        res.json(followUp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateFollowUp(req, res) {
    try {
        console.log('Update FollowUp - params:', req.params);
        console.log('Update FollowUp - body:', req.body);
        const { followup_id } = req.params;
        const updated = await followUpModel.updateFollowUp(followup_id, req.body);
        if (!updated) {
            console.log('Update FollowUp - not found or no changes');
            return res.status(404).json({ error: 'Not found or no changes' });
        }
        console.log('Update FollowUp - success');
        res.json({ success: true });
    } catch (err) {
        console.error('Update FollowUp - error:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function deleteFollowUp(req, res) {
    try {
        const { followup_id } = req.params;
        const deleted = await followUpModel.deleteFollowUp(followup_id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
