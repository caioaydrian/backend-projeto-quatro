import { Router } from "express";
import { SaleController } from "../controllers/sale.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const saleRoutes = Router();

saleRoutes.use(authMiddleware);

saleRoutes.post("/", SaleController.create);
saleRoutes.get("/", SaleController.findAll);
saleRoutes.get("/:id", SaleController.findById);
saleRoutes.put("/:id", SaleController.update);
saleRoutes.delete("/:id", SaleController.delete);

export { saleRoutes };
export default saleRoutes;
