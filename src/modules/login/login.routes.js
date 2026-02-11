import express from 'express';
import { loginController, forgotPasswordController, changePasswordController } from './login.controller.js';

const router = express.Router();

router.post('/', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/change-password', changePasswordController);

export default router;