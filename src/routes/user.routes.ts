import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post("/", UserController.create);
userRoutes.get("/", UserController.findAll);
userRoutes.get("/:id", UserController.findById);
userRoutes.put("/:id", UserController.update);
userRoutes.delete("/:id", UserController.delete);

export { userRoutes };
export default userRoutes;
