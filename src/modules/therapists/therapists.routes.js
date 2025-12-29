
import express from "express";
import { 
  createTherapistController, 
  getTherapistController,
  updateTherapistController,
  getTherapistIdByUserIdController,
  getTherapistMonthlyStatsController
} from "./therapists.controller.js";
import { createTherapist } from "./therapists.repo.js";

const router = express.Router();

// GET /therapists/:therapistId/monthly-stats - סטטיסטיקת חודש למטפל
router.get("/:therapistId/monthly-stats", getTherapistMonthlyStatsController);

// GET /therapists/byUser/:user_id - מחזיר therapist_id לפי user_id
router.get("/byUser/:user_id", getTherapistIdByUserIdController);

// POST /api/therapists - יצירת מטפל חדש
router.post("/create", async (req, res) => {
  console.log('--- קיבלתי בקשת POST /therapists/create ---');
  console.log('body מהפרונט:', JSON.stringify(req.body, null, 2));
  try {
    // נניח שהפונקציה createTherapist מיובאת מה-repo
    const result = await createTherapist(req.body);
    console.log('הוספת מטפל הצליחה:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('שגיאה בנתיב /therapists/create:', error);
    res.status(500).json({ error: error.message || 'שגיאה בהוספת מטפל' });
  }
});
router.get("/all", getTherapistController);

// PUT /api/therapists/updateTherapist/:therapistId - עדכון מטפל
router.put("/updateTherapist/:therapistId", updateTherapistController);

export default router;