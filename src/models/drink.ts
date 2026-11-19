import { DataTypes, ForeignKey, Model } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { sequelize } from "../database/sequelize.js";
import { Category } from "./category.js";

export class Drink extends Model {
  declare id: number;
  declare name: string;
  declare price: number;
  declare stock: number;
  declare categoryId: ForeignKey<Category["id"]>;
  declare imageUrl: string | null;

  public decreaseStock(quantity: number): void {
    const currentStock = Number(this.stock);
    if (currentStock < quantity) {
      throw new AppError(
        `Insufficient stock for '${this.name}'. Available: ${currentStock}, Requested: ${quantity}.`,
        400
      );
    }
    this.stock = currentStock - quantity;
  }

  public increaseStock(quantity: number): void {
    const currentStock = Number(this.stock);
    this.stock = currentStock + quantity;
  }
}

Drink.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Drink",
    tableName: "drinks",
  }
);
