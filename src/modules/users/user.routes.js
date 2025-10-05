import express from "express";
import { createUserController, deleteUserController, updateUserController } from "./user.controller.js";
import { loginController } from "../login/login.controller.js";

const router = express.Router();

// POST /api/users - יצירת משתמש חדש
router.post("/", createUserController);
router.post("/login", loginController);
router.delete("/deleteUser/:id", deleteUserController);
router.put("/updateUser/:id", updateUserController);
export default router;


// const router = require('express').Router();
// const controller = require('./user.controller');
// const validate = require('../../middlewares/validate');
// const { createUserSchema } = require('./user.validation');

// router.post('/', validate(createUserSchema), controller.create);
// router.get('/:id', controller.getById);

// module.exports = router;
