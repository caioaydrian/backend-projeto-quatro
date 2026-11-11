import "dotenv/config";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import { connectToDb } from "./database/sequelize.js";
import "./models/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
