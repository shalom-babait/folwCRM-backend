import express from "express";
import { createProspectController, getAllProspectsController } from "./prospects.controller.js";

const router = express.Router();


// יצירת prospect חדש
router.post("/", createProspectController);

// שליפת כל המתעניינים
router.get("/", getAllProspectsController);

export default router;
