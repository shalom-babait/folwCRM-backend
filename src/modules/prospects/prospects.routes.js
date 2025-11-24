import express from "express";
import { createProspectController, getAllProspectsController, updateProspectController, updateProspectWithCategoriesController } from "./prospects.controller.js";

const router = express.Router();

// עדכון prospect כולל קטגוריות
router.put("/updateWithCategories/:prospectId", updateProspectWithCategoriesController);
// עדכון prospect רגיל
router.put("/update/:prospectId", updateProspectController);
// יצירת prospect חדש
router.post("/create", createProspectController);
// שליפת כל המתעניינים
router.get("/getAll", getAllProspectsController);

export default router;
