import * as followUpModel from './followUp.model.js';

export async function createFollowUpService(data) {
    return await followUpModel.createFollowUp(data);
}

export async function getFollowUpsByPersonService(person_id) {
    return await followUpModel.getFollowUpsByPerson(person_id);
}

export async function getFollowUpByIdService(followup_id) {
    return await followUpModel.getFollowUpById(followup_id);
}

export async function updateFollowUpService(followup_id, updateData) {
    return await followUpModel.updateFollowUp(followup_id, updateData);
}

export async function deleteFollowUpService(followup_id) {
    return await followUpModel.deleteFollowUp(followup_id);
}
