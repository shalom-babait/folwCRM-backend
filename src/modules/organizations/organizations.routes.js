import express from 'express';
import { createOrganizationController, getAllOrganizationsController } from './organizations.controller.js';

const router = express.Router();

// שליפת כל הארגונים
router.get('/getAll', getAllOrganizationsController);

// יצירת ארגון
router.post('/create', createOrganizationController);

export default router;
