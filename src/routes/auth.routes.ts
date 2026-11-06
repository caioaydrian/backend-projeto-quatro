import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", AuthController.register);

export { authRoutes };
export default authRoutes;
