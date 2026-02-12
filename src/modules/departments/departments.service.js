import { getGroupsByDepartment, deleteDepartmentIfNoGroups, updateDepartment, insertDepartment, getDepartmentsWithGroups } from './departments.repo.js';
import { departmentSchema } from './department.model.js';

export async function getDepartmentGroups(department_id, organizationId = null) {
  return await getGroupsByDepartment(department_id, organizationId);
}

export async function removeDepartment(department_id, organizationId = null) {
  try {
    const success = await deleteDepartmentIfNoGroups(department_id, organizationId);
    if (!success) {
      throw new Error('Department not found or not deleted');
    }
    return { department_id };
  } catch (error) {
    throw error;
  }
}

export async function editDepartment(department_id, department_name, organizationId = null) {
  const { error } = departmentSchema.validate({ department_name });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    const success = await updateDepartment(department_id, department_name.trim(), organizationId);
    if (!success) {
      throw new Error('Department not found or name unchanged');
    }
    return { department_id, department_name };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Department name must be unique');
    }
    throw error;
  }
}

export async function addDepartment(department_name, organizationId = null) {
  const { error } = departmentSchema.validate({ department_name });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    return await insertDepartment(department_name.trim(), organizationId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Department name must be unique');
    }
    throw error;
  }
}

export async function getAllGroupsWithDepartment() {
  return await import('./departments.repo.js').then(m => m.getAllGroupsWithDepartment());
}

export async function getDepartmentsWithGroupsService() {
  return await getDepartmentsWithGroups();
}
