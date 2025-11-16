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
    const { department_name } = req.body;
    const updated = await editDepartment(department_id, department_name);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function removeDepartmentController(req, res) {
  try {
    const { department_id } = req.params;
    const result = await removeDepartment(department_id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getGroupsByDepartmentController(req, res) {
  try {
    const { department_id } = req.params;
    const groups = await getDepartmentGroups(department_id);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDepartmentsController(req, res) {
  try {
    const departments = await getAllDepartments();
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addDepartmentController(req, res) {
  try {
    const { department_name } = req.body;
    const newDepartment = await addDepartment(department_name);
    res.status(201).json({ success: true, data: newDepartment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllGroupsWithDepartmentController(req, res) {
  try {
    const groups = await getAllGroupsWithDepartment();
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDepartmentsWithGroupsController(req, res) {
  try {
    console.log('Fetching departments with groups');
    const departmentsWithGroups = await getDepartmentsWithGroups();
    // הפונקציה מחזירה מערך של אובייקטים במבנה:
    // { department: { department_id, department_name }, groups: [ ... ] }
    res.json({ success: true, data: departmentsWithGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
