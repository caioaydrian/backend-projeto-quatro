import "dotenv/config";
import cors from "cors";
import express, { type Express } from "express";
import { connectToDb } from "./database/sequelize.js";
import "./models/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { drinkRoutes } from "./routes/drink.routes.js";
import { saleRoutes } from "./routes/sale.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app: Express = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());

connectToDb().then(() => {});

// rotas públicas
app.use("/auth", authRoutes);

// Rotas privadas
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/drinks", drinkRoutes);
app.use("/sales", saleRoutes);
app.use("/reviews", reviewRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
