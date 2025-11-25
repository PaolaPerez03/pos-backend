import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

const router = Router();

// Login
router.post("/login", loginUser);

export default router;
