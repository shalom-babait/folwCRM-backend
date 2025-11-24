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
    const groups = await getAllGroupsWithDepartmentService();
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addGroupController(req, res) {
  try {
    const group = await addGroupService(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function editGroupController(req, res) {
  try {
    const { group_id } = req.params;
    const group = await editGroupService(group_id, req.body);
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteGroupController(req, res) {
  try {
    const { group_id } = req.params;
    const result = await deleteGroupService(group_id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getGroupUsersController(req, res) {
  try {
    const { group_id } = req.params;
    const users = await getGroupUsersService(group_id);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTherapistsByGroupController(req, res) {  
  try {
    const { group_id } = req.params;
    const users = await getTherapistsByGroupService(group_id);    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

