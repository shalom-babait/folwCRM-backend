import express from 'express';
import * as followUpsController from './followUps.controller.js';

const router = express.Router();


router.post('/', followUpsController.createFollowUp);
router.get('/person/:person_id', followUpsController.getFollowUpsByPerson);
router.get('/creator/:created_by_person_id', followUpsController.getUpcomingFollowUpsByCreator);
router.get('/:followup_id', followUpsController.getFollowUpById);
router.put('/:followup_id', followUpsController.updateFollowUp);
router.delete('/:followup_id', followUpsController.deleteFollowUp);

export default router;
