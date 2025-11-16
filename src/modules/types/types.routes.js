import express from "express";
import { createTypeController, deleteTypeController, getTypesController, updateTypeController } from "./types.controller.js";

const router = express.Router();

router.get("/getTypes",getTypesController)
router.post("/",createTypeController)
router.delete("/deleteType/:id", deleteTypeController);
router.put("/updateType/:id", updateTypeController);
export default router;