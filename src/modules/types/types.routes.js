import express from "express";
import { createTypeController, getTypesController } from "./types.controller.js";

const router = express.Router();

router.get("/getTypes",getTypesController)
router.post("/",createTypeController)

export default router;