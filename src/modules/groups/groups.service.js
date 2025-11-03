import { getAllGroupsWithDepartment } from './groups.repo.js';
import { groupSchema } from './group.model.js';
import { addGroup as addGroupRepo } from './groups.repo.js';
import { editGroup as editGroupRepo } from './groups.repo.js';
import { deleteGroupIfNoUsers } from './groups.repo.js';
import { getGroupUsers } from './groups.repo.js';

export async function getAllGroupsWithDepartmentService() {
  return await getAllGroupsWithDepartment();
}

export async function addGroupService(data) {
  const { error } = groupSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await addGroupRepo(data);
}

export async function editGroupService(group_id, data) {
  const { error } = groupSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await editGroupRepo(group_id, data);
}

export async function deleteGroupService(group_id) {
  return await deleteGroupIfNoUsers(group_id);
}

export async function getGroupUsersService(group_id) {
  return await getGroupUsers(group_id);
}

// אפשר להוסיף כאן פונקציות CRUD נוספות לקבוצות
