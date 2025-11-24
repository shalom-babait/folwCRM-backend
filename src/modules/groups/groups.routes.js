import express from 'express';
import { getAllGroupsWithDepartmentController, addGroupController, editGroupController, deleteGroupController, getGroupUsersController,getTherapistsByGroupController } from './groups.controller.js';

const router = express.Router();

router.get('/all', getAllGroupsWithDepartmentController);
router.post('/add_group', addGroupController);
router.put('/edit_group/:group_id', editGroupController);
router.delete('/delete_group/:group_id', deleteGroupController);
router.get('/group_users/:group_id', getGroupUsersController);
router.get('/group_therapists/:group_id', getTherapistsByGroupController);

export default router;
