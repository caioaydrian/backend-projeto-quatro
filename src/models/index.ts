import { User } from "./user.js";
import { Drink } from "./drink.js";
import { Category } from "./category.js";
import { Sale } from "./sale.js";
import { SaleItem } from "./sale-item.js";
import { Review } from "./review.js";

// Category 1 - N Drink
Category.hasMany(Drink, { foreignKey: "categoryId", as: "drinks" });
Drink.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// User 1 - N Sale
User.hasMany(Sale, { foreignKey: "userId", as: "sales" });
Sale.belongsTo(User, { foreignKey: "userId", as: "user" });

// Sale 1 - N SaleItem
Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

// Drink 1 - N SaleItem
Drink.hasMany(SaleItem, { foreignKey: "drinkId", as: "saleItems" });
SaleItem.belongsTo(Drink, { foreignKey: "drinkId", as: "drink" });

// N:N Venda e Drink
Sale.belongsToMany(Drink, {
  through: SaleItem,
  foreignKey: "saleId",
  otherKey: "drinkId",
  as: "drinks",
});
Drink.belongsToMany(Sale, {
  through: SaleItem,
  foreignKey: "drinkId",
  otherKey: "saleId",
  as: "sales",
});

// User 1 - N Review
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Drink 1 - N Review
Drink.hasMany(Review, { foreignKey: "drinkId", as: "reviews" });
Review.belongsTo(Drink, { foreignKey: "drinkId", as: "drink" });

export { User, Drink, Category, Sale, SaleItem, Review };
