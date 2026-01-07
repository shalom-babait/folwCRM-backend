import { addTask, deleteTask, updateTask, getTasksByPatientId } from './task.repo.js';

export async function addTaskService(task) {
	return await addTask(task);
}

export async function deleteTaskService(task_id) {
	return await deleteTask(task_id);
}

export async function updateTaskService(task_id, updateData) {
	return await updateTask(task_id, updateData);
}

export async function getTasksByPatientIdService(patient_id) {
	return await getTasksByPatientId(patient_id);
}
