import { User } from "./user.js";
import { Drink } from "./drink.js";
import { Category } from "./category.js";

Category.hasMany(Drink, { foreignKey: "categoryId" });
Drink.belongsTo(Category, { foreignKey: "categoryId" });

export { User, Drink, Category };
