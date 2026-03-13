import express from "express";
import usersController from "../controllers/users.controller.js";

const router = express.Router();

router.get("/:id", usersController.getUserById);

export default router;
