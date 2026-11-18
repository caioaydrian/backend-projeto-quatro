import { Sequelize } from "sequelize";
import { User } from "../models/user.js";

export const sequelize = new Sequelize({
  dialect: "mysql",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
});

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@coffee.com";
  const exists = await User.findOne({ where: { email: adminEmail } });

  if (!exists) {
    await User.create({
      name: "Administrador",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "admin123",
      cpf: process.env.ADMIN_CPF || "00000000000",
      role: "admin",
    });
    console.log(`Admin user created (${adminEmail})!`);
  }
}

export async function connectToDb() {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to the database!");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully (tables created)!");

    await seedAdminUser();
  } catch (err) {
    console.error("Database connection/sync error:", err);
  }
}
