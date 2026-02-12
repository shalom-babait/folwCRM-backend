import { getAllDepartments } from './departments.repo.js';
import {
  addDepartment,
  editDepartment,
  removeDepartment,
  getDepartmentGroups
} from './departments.service.js';
import { getDepartmentsWithGroupsService } from './departments.service.js';
import { getAllGroupsWithDepartment } from './departments.repo.js';
import { getDepartmentsWithGroups } from './departments.repo.js';

export async function editDepartmentController(req, res) {
  try {
    const { department_id } = req.params;
    const organizationId = req.organization_id;
    const { department_name } = req.body;
    const updated = await editDepartment(department_id, department_name, organizationId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function removeDepartmentController(req, res) {
  try {
    const { department_id } = req.params;
    const organizationId = req.organization_id;
    const result = await removeDepartment(department_id, organizationId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getGroupsByDepartmentController(req, res) {
  try {
    const { department_id } = req.params;
    const organizationId = req.organization_id;
    const groups = await getDepartmentGroups(department_id, organizationId);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDepartmentsController(req, res) {
  try {
    const organizationId = req.organization_id;
    const departments = await getAllDepartments(organizationId);
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addDepartmentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const { department_name } = req.body;
    const newDepartment = await addDepartment(department_name, organizationId);
    res.status(201).json({ success: true, data: newDepartment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllGroupsWithDepartmentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const groups = await getAllGroupsWithDepartment(organizationId);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDepartmentsWithGroupsController(req, res) {
  try {
    console.log('Fetching departments with groups');
    const organizationId = req.organization_id;
    const departmentsWithGroups = await getDepartmentsWithGroups(organizationId);
    // הפונקציה מחזירה מערך של אובייקטים במבנה:
    // { department: { department_id, department_name }, groups: [ ... ] }
    res.json({ success: true, data: departmentsWithGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
