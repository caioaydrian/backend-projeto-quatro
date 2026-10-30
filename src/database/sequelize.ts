import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "mysql",
  database: "coffee_db",
  username: "coffee_user",
  password: "coffee_password",
  port: 3306,
  host: "localhost",
});

export async function connectToDb() {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to the database!");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully (tables created)!");
  } catch (err) {
    console.error(err);
  }
}
