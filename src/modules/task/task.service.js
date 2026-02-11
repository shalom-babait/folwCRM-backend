import { getTasksByUserId as repoGetTasksByUserId } from './task.repo.js';

export async function getTasksByUserIdService(user_id, organizationId = null) {
	return await repoGetTasksByUserId(user_id, organizationId);
}
import { addTask, deleteTask, updateTaskWithAssignments, getTasksByPatientId } from './task.repo.js';

export async function addTaskService(task, organizationId = null) {
	return await addTask(task, organizationId);
}

export async function deleteTaskService(task_id, organizationId = null) {
	return await deleteTask(task_id, organizationId);
}


export async function updateTaskService(task_id, updateData, organizationId = null) {
    return await updateTaskWithAssignments(task_id, updateData, organizationId);
}

export async function getTasksByPatientIdService(patient_id, organizationId = null) {
	return await getTasksByPatientId(patient_id, organizationId);
}
