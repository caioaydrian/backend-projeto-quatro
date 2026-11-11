import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const categoryRoutes = Router();

categoryRoutes.use(authMiddleware);

categoryRoutes.post("/", CategoryController.create);
categoryRoutes.get("/", CategoryController.findAll);
categoryRoutes.get("/:id", CategoryController.findById);
categoryRoutes.put("/:id", CategoryController.update);
categoryRoutes.delete("/:id", CategoryController.delete);

export { categoryRoutes };
export default categoryRoutes;
