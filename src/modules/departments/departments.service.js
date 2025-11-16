import { getGroupsByDepartment, deleteDepartmentIfNoGroups, updateDepartment, insertDepartment, getDepartmentsWithGroups } from './departments.repo.js';
import { departmentSchema } from './department.model.js';

export async function getDepartmentGroups(department_id) {
  return await getGroupsByDepartment(department_id);
}

export async function removeDepartment(department_id) {
  try {
    const success = await deleteDepartmentIfNoGroups(department_id);
    if (!success) {
      throw new Error('Department not found or not deleted');
    }
    return { department_id };
  } catch (error) {
    throw error;
  }
}

export async function editDepartment(department_id, department_name) {
  const { error } = departmentSchema.validate({ department_name });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    const success = await updateDepartment(department_id, department_name.trim());
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

export async function addDepartment(department_name) {
  const { error } = departmentSchema.validate({ department_name });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    return await insertDepartment(department_name.trim());
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
