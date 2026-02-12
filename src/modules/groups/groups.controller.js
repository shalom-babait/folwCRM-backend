import {
  getAllGroupsWithDepartmentService,
  addGroupService,
  editGroupService,
  deleteGroupService,
  getGroupUsersService,
  getTherapistsByGroupService
} from './groups.service.js';
export async function getAllGroupsWithDepartmentController(req, res) {
  try {
    const organizationId = req.organization_id;
    const groups = await getAllGroupsWithDepartmentService(organizationId);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addGroupController(req, res) {
  try {
    const organizationId = req.organization_id;
    const group = await addGroupService(req.body, organizationId);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function editGroupController(req, res) {
  try {
    const { group_id } = req.params;
    const organizationId = req.organization_id;
    const group = await editGroupService(group_id, req.body, organizationId);
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteGroupController(req, res) {
  try {
    const { group_id } = req.params;
    const organizationId = req.organization_id;
    const result = await deleteGroupService(group_id, organizationId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getGroupUsersController(req, res) {
  try {
    const { group_id } = req.params;
    const organizationId = req.organization_id;
    const users = await getGroupUsersService(group_id, organizationId);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTherapistsByGroupController(req, res) {  
  try {
    const { group_id } = req.params;
    const organizationId = req.organization_id;
    const users = await getTherapistsByGroupService(group_id, organizationId);    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

