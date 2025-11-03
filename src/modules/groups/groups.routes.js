import express from 'express';
import { getAllGroupsWithDepartmentController, addGroupController, editGroupController, deleteGroupController, getGroupUsersController } from './groups.controller.js';

const router = express.Router();

router.get('/all', getAllGroupsWithDepartmentController);
router.post('/', addGroupController);
router.put('/:group_id', editGroupController);
router.delete('/:group_id', deleteGroupController);
router.get('/:group_id/users', getGroupUsersController);

export default router;
