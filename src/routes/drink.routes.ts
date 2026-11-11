import { Router } from "express";
import { DrinkController } from "../controllers/drink.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const drinkRoutes = Router();

drinkRoutes.use(authMiddleware);

drinkRoutes.post("/", DrinkController.create);
drinkRoutes.get("/", DrinkController.findAll);
drinkRoutes.get("/:id", DrinkController.findById);
drinkRoutes.put("/:id", DrinkController.update);
drinkRoutes.delete("/:id", DrinkController.delete);

export { drinkRoutes };
export default drinkRoutes;
