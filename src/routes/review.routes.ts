import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const reviewRoutes = Router();

reviewRoutes.get("/", ReviewController.findAll);
reviewRoutes.get("/:id", ReviewController.findById);

reviewRoutes.use(authMiddleware);

reviewRoutes.post("/", ReviewController.create);
reviewRoutes.put("/:id", ReviewController.update);
reviewRoutes.delete("/:id", ReviewController.delete);

export { reviewRoutes };
export default reviewRoutes;
