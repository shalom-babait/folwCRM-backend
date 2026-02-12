import { getAllGroupsWithDepartment } from './groups.repo.js';
import { groupSchema } from './group.model.js';
import { addGroup as addGroupRepo } from './groups.repo.js';
import { editGroup as editGroupRepo } from './groups.repo.js';
import { deleteGroupIfNoUsers } from './groups.repo.js';
import { getGroupUsers ,getTherapistsByGroup} from './groups.repo.js';

export async function getAllGroupsWithDepartmentService(organizationId = null) {
  return await getAllGroupsWithDepartment(organizationId);
}

export async function addGroupService(data, organizationId = null) {
  const { error } = groupSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await addGroupRepo(data, organizationId);
}

export async function editGroupService(group_id, data, organizationId = null) {
  const { error } = groupSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await editGroupRepo(group_id, data, organizationId);
}

export async function deleteGroupService(group_id, organizationId = null) {
  return await deleteGroupIfNoUsers(group_id, organizationId);
}

export async function getGroupUsersService(group_id, organizationId = null) {
  return await getGroupUsers(group_id, organizationId);
}

export async function getTherapistsByGroupService(group_id, organizationId = null) {
  return await getTherapistsByGroup(group_id, organizationId);
}

// אפשר להוסיף כאן פונקציות CRUD נוספות לקבוצות
