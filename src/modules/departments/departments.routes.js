import express from 'express';
import {
	getDepartmentsController,
	addDepartmentController,
	editDepartmentController,
	removeDepartmentController,
	getGroupsByDepartmentController,
	getAllGroupsWithDepartmentController,
	getDepartmentsWithGroupsController
} from './departments.controller.js';

const router = express.Router();

router.get('/', getDepartmentsController);
router.post('/', addDepartmentController);
router.put('/:department_id', editDepartmentController);
router.delete('/:department_id', removeDepartmentController);
router.get('/:department_id/groups', getGroupsByDepartmentController);
router.get('/groups-with-department', getAllGroupsWithDepartmentController);
router.get('/with-groups', getDepartmentsWithGroupsController);
export default router;
