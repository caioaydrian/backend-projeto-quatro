import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "mysql",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
});

export async function connectToDb(retries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("Successfully connected to the database!");

      await sequelize.sync({ alter: true });
      console.log("Database synchronized successfully (tables created)!");

      await seedAdminUser();
      return;
    } catch (err) {
      console.error(
        `Database connection/sync attempt ${attempt}/${retries} failed. Retrying in ${delayMs / 1000}s...`
      );
      if (attempt === retries) {
        console.error("All database connection attempts failed:", err);
      } else {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}

async function seedAdminUser() {
  const { User } = await import("../models/user.js");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@coffee.com";
  const exists = await User.findOne({ where: { email: adminEmail } });

  if (!exists) {
    await User.create({
      name: "Administrator",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "admin123",
      cpf: process.env.ADMIN_CPF || "00000000000",
      role: "admin",
    });
    console.log(`Admin user created (${adminEmail})!`);
  }
}
