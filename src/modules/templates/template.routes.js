import express from 'express';
import { createTemplateController, updateTemplateController, getTemplateByIdController } from './template.controller.js';

const router = express.Router();

// יצירת תבנית עם שאלות
router.post('/create', createTemplateController);
// עדכון תבנית עם שאלות
router.put('/update/:id', updateTemplateController);
// שליפת תבנית מלאה
router.get('/get/:id', getTemplateByIdController);

export default router;
