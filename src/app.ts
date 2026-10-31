import express, { type Express, type Request, type Response } from "express";
import { connectToDb } from "./database/sequelize.js";
import "./models/index.js";
import { userRoutes } from "./routes/user.routes.js";

const app: Express = express();

app.use(express.json());

connectToDb().then(() => {});

app.use("/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
