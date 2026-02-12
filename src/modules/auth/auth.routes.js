import express from 'express';
import { initiateGoogleAuth, handleGoogleAuth, googleCallbackController } from './auth.controller.js';

const router = express.Router();

// נתיב התחלת אימות Google
router.get('/google', initiateGoogleAuth);

// נתיב callback מ-Google
router.get('/google/callback', handleGoogleAuth, googleCallbackController);

export default router;
